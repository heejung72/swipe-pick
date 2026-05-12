package com.swipepick.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "photos")
@Getter @Setter
@NoArgsConstructor
@ToString(exclude = {"room", "comments"})
public class Photo {

    @Id
    private String id;

    private String filename;
    private String url;
    private int bestCount = 0;
    private int worstCount = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    @JsonIgnore
    private Room room;

    @Column(name = "photo_order")
    private int photoOrder;

    @OneToMany(mappedBy = "photo", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @OrderBy("timestamp ASC")
    private List<Comment> comments = new ArrayList<>();

    public double getSurvivalRate() {
        int total = bestCount + worstCount;
        if (total == 0) return 0;
        return Math.round((bestCount * 100.0 / total) * 10) / 10.0;
    }

    public int getTotalVotes() {
        return bestCount + worstCount;
    }
}
