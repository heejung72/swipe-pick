package com.swipepick.model;

import lombok.Data;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Data
public class Room {
    private String code;
    private String hostName;
    private List<Photo> photos = new ArrayList<>();
    private String status = "OPEN"; // OPEN, CLOSED
    private long createdAt = System.currentTimeMillis();

    // voterName → Set<photoId> (중복 투표 방지)
    private Map<String, Set<String>> voterVotes = new ConcurrentHashMap<>();

    public Room(String code, String hostName) {
        this.code = code;
        this.hostName = hostName;
    }

    public boolean hasVoted(String voterName, String photoId) {
        return voterVotes.getOrDefault(voterName, Set.of()).contains(photoId);
    }

    public void recordVote(String voterName, String photoId) {
        voterVotes.computeIfAbsent(voterName, k -> ConcurrentHashMap.newKeySet()).add(photoId);
    }

    public int getTotalVoters() {
        return voterVotes.size();
    }

    public int getTotalSwipes() {
        return photos.stream().mapToInt(Photo::getTotalVotes).sum();
    }

    public Photo getBestPhoto() {
        return photos.stream()
            .max(Comparator.comparingDouble(Photo::getSurvivalRate))
            .orElse(null);
    }

    public double getBeautyScore() {
        int total = photos.stream().mapToInt(Photo::getTotalVotes).sum();
        int best = photos.stream().mapToInt(Photo::getBestCount).sum();
        if (total == 0) return 0;
        return Math.round((best * 100.0 / total) * 10) / 10.0;
    }
}
