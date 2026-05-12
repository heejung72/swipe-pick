package com.swipepick.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "comments")
@Getter @Setter
@NoArgsConstructor
@ToString(exclude = "photo")
public class Comment {

    @Id
    private String id;

    private String voterName;

    @Column(columnDefinition = "TEXT")
    private String text;

    private long timestamp;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "photo_id", nullable = false)
    @JsonIgnore
    private Photo photo;
}
