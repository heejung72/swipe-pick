package com.swipepick.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "voter_votes",
    uniqueConstraints = @UniqueConstraint(columnNames = {"room_id", "voter_name", "photo_id"}))
@Getter @Setter
@NoArgsConstructor
public class VoterVote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @Column(name = "voter_name", nullable = false)
    private String voterName;

    @Column(name = "photo_id", nullable = false)
    private String photoId;

    public VoterVote(Room room, String voterName, String photoId) {
        this.room = room;
        this.voterName = voterName;
        this.photoId = photoId;
    }
}
