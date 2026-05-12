package com.swipepick.controller;

import com.swipepick.model.Photo;
import com.swipepick.model.Room;
import com.swipepick.service.FileService;
import com.swipepick.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@Controller
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;
    private final FileService fileService;

    @Value("${server.port:8081}")
    private String serverPort;

    // 방 생성 + 사진 업로드
    @PostMapping("/api/rooms")
    @ResponseBody
    public ResponseEntity<?> createRoom(
        @RequestParam("hostName") String hostName,
        @RequestParam("photos") MultipartFile[] files,
        @RequestHeader(value = "Origin", defaultValue = "") String origin
    ) {
        if (files == null || files.length == 0) {
            return ResponseEntity.badRequest().body(Map.of("error", "사진을 업로드해주세요."));
        }
        if (files.length > 20) {
            return ResponseEntity.badRequest().body(Map.of("error", "사진은 최대 20장까지 가능해요."));
        }

        try {
            String baseUrl = origin.isBlank() ? "http://localhost:" + serverPort : origin;
            List<Photo> photos = new ArrayList<>();
            for (MultipartFile file : files) {
                String url = fileService.upload(file);

                if (url.startsWith("/")) url = baseUrl + url;
                Photo photo = new Photo();
                photo.setId(UUID.randomUUID().toString());
                photo.setFilename(url);
                photo.setUrl(url);
                photos.add(photo);
            }

            Room room = roomService.createRoom(hostName, photos);
            return ResponseEntity.ok(Map.of(
                "code", room.getCode(),
                "hostName", room.getHostName(),
                "photoCount", photos.size()
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "업로드 실패: " + e.getMessage()));
        }
    }

    @GetMapping("/api/rooms/{code}")
    @ResponseBody
    public ResponseEntity<?> getRoom(@PathVariable String code) {
        Room room = roomService.getRoom(code);
        if (room == null) return ResponseEntity.notFound().build();

        List<Map<String, Object>> photos = room.getPhotos().stream().map(p -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", p.getId());
            m.put("url", p.getUrl());
            m.put("bestCount", p.getBestCount());
            m.put("worstCount", p.getWorstCount());
            m.put("survivalRate", p.getSurvivalRate());
            m.put("comments", p.getComments());
            return m;
        }).toList();

        return ResponseEntity.ok(Map.of(
            "code", room.getCode(),
            "hostName", room.getHostName(),
            "photos", photos,
            "status", room.getStatus(),
            "totalVoters", roomService.getTotalVoters(code),
            "beautyScore", room.getBeautyScore()
        ));
    }

    // 결과 조회 (생존율 순 정렬)
    @GetMapping("/api/rooms/{code}/results")
    @ResponseBody
    public ResponseEntity<?> getResults(@PathVariable String code) {
        Room room = roomService.getRoom(code);
        if (room == null) return ResponseEntity.notFound().build();

        Photo best = room.getBestPhoto();
        return ResponseEntity.ok(Map.of(
            "photos", roomService.getPhotoResults(code),
            "bestPhotoId", best != null ? best.getId() : "",
            "beautyScore", room.getBeautyScore(),
            "totalVoters", roomService.getTotalVoters(code),
            "totalSwipes", room.getTotalSwipes(),
            "hostName", room.getHostName()
        ));
    }

    // WebSocket: 스와이프
    @MessageMapping("/swipe")
    public void swipe(@Payload Map<String, String> payload) {
        roomService.swipe(
            payload.get("roomCode"),
            payload.get("photoId"),
            payload.get("direction"),
            payload.get("voterName")
        );
    }

    // WebSocket: 댓글
    @MessageMapping("/comment")
    public void comment(@Payload Map<String, String> payload) {
        roomService.addComment(
            payload.get("roomCode"),
            payload.get("photoId"),
            payload.get("voterName"),
            payload.get("text")
        );
    }
}
