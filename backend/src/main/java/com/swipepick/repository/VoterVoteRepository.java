package com.swipepick.repository;

import com.swipepick.model.VoterVote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface VoterVoteRepository extends JpaRepository<VoterVote, Long> {

    boolean existsByRoomCodeAndVoterNameAndPhotoId(String roomCode, String voterName, String photoId);

    @Query("SELECT COUNT(DISTINCT v.voterName) FROM VoterVote v WHERE v.room.code = :roomCode")
    long countDistinctVotersByRoomCode(@Param("roomCode") String roomCode);
}
