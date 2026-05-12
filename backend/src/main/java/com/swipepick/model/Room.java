package com.swipepick.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.*;

@Entity
@Table(name = "rooms")
@Getter @Setter
@NoArgsConstructor
@ToString(exclude = "photos")
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 8)
    private String code;

    @Column(nullable = false)
    private String hostName;

    @Column(nullable = false)
    private String status = "OPEN";

    private long createdAt = System.currentTimeMillis();

    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @OrderColumn(name = "photo_order")
    private List<Photo> photos = new ArrayList<>();

    public Room(String code, String hostName) {
        this.code = code;
        this.hostName = hostName;
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
