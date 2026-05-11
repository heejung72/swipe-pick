package com.swipepick.model;

import lombok.Data;
import java.util.ArrayList;
import java.util.List;

@Data
public class Photo {
    private String id;
    private String filename;
    private String url;
    private int bestCount = 0;
    private int worstCount = 0;
    private List<Comment> comments = new ArrayList<>();

    public double getSurvivalRate() {
        int total = bestCount + worstCount;
        if (total == 0) return 0;
        return Math.round((bestCount * 100.0 / total) * 10) / 10.0;
    }

    public int getTotalVotes() {
        return bestCount + worstCount;
    }

    @Data
    public static class Comment {
        private String id;
        private String voterName;
        private String text;
        private long timestamp;
    }
}
