package com.swipepick.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class SwipeMessage {
    private String type;       // SWIPE, COMMENT, ROOM_CLOSED
    private String photoId;
    private String direction;  // BEST, WORST
    private int bestCount;
    private int worstCount;
    private double survivalRate;
    private String voterName;
    private String comment;
    private String commentId;
    private int totalSwipes;
    private int totalVoters;
    private double beautyScore;
    private List<Map<String, Object>> photos;
}
