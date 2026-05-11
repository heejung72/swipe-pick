package com.swipepick.service;

import com.swipepick.dto.SwipeMessage;
import com.swipepick.model.Photo;
import com.swipepick.model.Room;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class RoomService {

    private final SimpMessagingTemplate messaging;
    private final Map<String, Room> rooms = new ConcurrentHashMap<>();

    public Room createRoom(String hostName, List<Photo> photos) {
        String code = generateCode();
        Room room = new Room(code, hostName);
        room.setPhotos(photos);
        rooms.put(code, room);
        log.info("Room created: {} by {}", code, hostName);
        return room;
    }

    public Room getRoom(String code) {
        return rooms.get(code.toUpperCase());
    }

    public SwipeMessage swipe(String roomCode, String photoId, String direction, String voterName) {
        Room room = rooms.get(roomCode.toUpperCase());
        if (room == null) return null;

        Photo photo = room.getPhotos().stream()
            .filter(p -> p.getId().equals(photoId))
            .findFirst().orElse(null);
        if (photo == null) return null;

        // 중복 투표 허용 (같은 사람이 여러 사진 투표 가능, 한 사진에 한 번)
        if (room.hasVoted(voterName, photoId)) return null;
        room.recordVote(voterName, photoId);

        if ("BEST".equals(direction)) {
            photo.setBestCount(photo.getBestCount() + 1);
        } else {
            photo.setWorstCount(photo.getWorstCount() + 1);
        }

        SwipeMessage msg = SwipeMessage.builder()
            .type("SWIPE")
            .photoId(photoId)
            .direction(direction)
            .bestCount(photo.getBestCount())
            .worstCount(photo.getWorstCount())
            .survivalRate(photo.getSurvivalRate())
            .voterName(voterName)
            .totalSwipes(room.getTotalSwipes())
            .totalVoters(room.getTotalVoters())
            .beautyScore(room.getBeautyScore())
            .build();

        messaging.convertAndSend("/topic/room/" + room.getCode(), msg);
        return msg;
    }

    public void addComment(String roomCode, String photoId, String voterName, String text) {
        Room room = rooms.get(roomCode.toUpperCase());
        if (room == null) return;

        Photo photo = room.getPhotos().stream()
            .filter(p -> p.getId().equals(photoId))
            .findFirst().orElse(null);
        if (photo == null) return;

        Photo.Comment comment = new Photo.Comment();
        comment.setId(UUID.randomUUID().toString());
        comment.setVoterName(voterName);
        comment.setText(text);
        comment.setTimestamp(System.currentTimeMillis());
        photo.getComments().add(comment);

        SwipeMessage msg = SwipeMessage.builder()
            .type("COMMENT")
            .photoId(photoId)
            .voterName(voterName)
            .comment(text)
            .commentId(comment.getId())
            .build();

        messaging.convertAndSend("/topic/room/" + room.getCode(), msg);
    }

    public List<Map<String, Object>> getPhotoResults(String roomCode) {
        Room room = rooms.get(roomCode.toUpperCase());
        if (room == null) return List.of();

        return room.getPhotos().stream().map(p -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", p.getId());
            m.put("url", p.getUrl());
            m.put("bestCount", p.getBestCount());
            m.put("worstCount", p.getWorstCount());
            m.put("survivalRate", p.getSurvivalRate());
            m.put("totalVotes", p.getTotalVotes());
            m.put("comments", p.getComments());
            return m;
        }).sorted(Comparator.comparingDouble(
            m -> -((Number) m.get("survivalRate")).doubleValue()
        )).collect(Collectors.toList());
    }

    private String generateCode() {
        String chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        Random rnd = new Random();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 6; i++) sb.append(chars.charAt(rnd.nextInt(chars.length())));
        String code = sb.toString();
        return rooms.containsKey(code) ? generateCode() : code;
    }
}
