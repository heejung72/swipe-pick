package com.swipepick.service;

import com.swipepick.dto.SwipeMessage;
import com.swipepick.model.Comment;
import com.swipepick.model.Photo;
import com.swipepick.model.Room;
import com.swipepick.model.VoterVote;
import com.swipepick.repository.PhotoRepository;
import com.swipepick.repository.RoomRepository;
import com.swipepick.repository.VoterVoteRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class RoomService {

    private final SimpMessagingTemplate messaging;
    private final RoomRepository roomRepository;
    private final PhotoRepository photoRepository;
    private final VoterVoteRepository voterVoteRepository;

    @Transactional
    public Room createRoom(String hostName, List<Photo> photos) {
        String code = generateCode();
        Room room = new Room(code, hostName);
        for (int i = 0; i < photos.size(); i++) {
            Photo photo = photos.get(i);
            photo.setRoom(room);
            photo.setPhotoOrder(i);
        }
        room.setPhotos(photos);
        Room saved = roomRepository.save(room);
        log.info("Room created: {} by {}", code, hostName);
        return saved;
    }

    @Transactional(readOnly = true)
    public Room getRoom(String code) {
        return roomRepository.findByCode(code.toUpperCase()).orElse(null);
    }

    @Transactional
    public SwipeMessage swipe(String roomCode, String photoId, String direction, String voterName) {
        String upperCode = roomCode.toUpperCase();
        Room room = roomRepository.findByCode(upperCode).orElse(null);
        if (room == null) return null;

        Photo photo = room.getPhotos().stream()
            .filter(p -> p.getId().equals(photoId))
            .findFirst().orElse(null);
        if (photo == null) return null;

        if (voterVoteRepository.existsByRoomCodeAndVoterNameAndPhotoId(upperCode, voterName, photoId)) {
            return null;
        }

        voterVoteRepository.save(new VoterVote(room, voterName, photoId));

        if ("BEST".equals(direction)) {
            photo.setBestCount(photo.getBestCount() + 1);
        } else {
            photo.setWorstCount(photo.getWorstCount() + 1);
        }
        photoRepository.save(photo);

        int totalVoters = (int) voterVoteRepository.countDistinctVotersByRoomCode(upperCode);

        SwipeMessage msg = SwipeMessage.builder()
            .type("SWIPE")
            .photoId(photoId)
            .direction(direction)
            .bestCount(photo.getBestCount())
            .worstCount(photo.getWorstCount())
            .survivalRate(photo.getSurvivalRate())
            .voterName(voterName)
            .totalSwipes(room.getTotalSwipes())
            .totalVoters(totalVoters)
            .beautyScore(room.getBeautyScore())
            .build();

        messaging.convertAndSend("/topic/room/" + room.getCode(), msg);
        return msg;
    }

    @Transactional
    public void addComment(String roomCode, String photoId, String voterName, String text) {
        Room room = roomRepository.findByCode(roomCode.toUpperCase()).orElse(null);
        if (room == null) return;

        Photo photo = room.getPhotos().stream()
            .filter(p -> p.getId().equals(photoId))
            .findFirst().orElse(null);
        if (photo == null) return;

        Comment comment = new Comment();
        comment.setId(UUID.randomUUID().toString());
        comment.setVoterName(voterName);
        comment.setText(text);
        comment.setTimestamp(System.currentTimeMillis());
        comment.setPhoto(photo);
        photo.getComments().add(comment);
        photoRepository.save(photo);

        SwipeMessage msg = SwipeMessage.builder()
            .type("COMMENT")
            .photoId(photoId)
            .voterName(voterName)
            .comment(text)
            .commentId(comment.getId())
            .build();

        messaging.convertAndSend("/topic/room/" + room.getCode(), msg);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getPhotoResults(String roomCode) {
        Room room = roomRepository.findByCode(roomCode.toUpperCase()).orElse(null);
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

    @Transactional(readOnly = true)
    public int getTotalVoters(String roomCode) {
        return (int) voterVoteRepository.countDistinctVotersByRoomCode(roomCode.toUpperCase());
    }

    private String generateCode() {
        String chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        Random rnd = new Random();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 6; i++) sb.append(chars.charAt(rnd.nextInt(chars.length())));
        String code = sb.toString();
        return roomRepository.findByCode(code).isPresent() ? generateCode() : code;
    }
}
