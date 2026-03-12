package com.pcwk.ehr.trip;

import com.pcwk.ehr.cmn.WorkDiv;
import com.pcwk.ehr.domain.TripVO;
<<<<<<< HEAD

=======
import java.util.List;
>>>>>>> 6b42e8f5a0cab4098e44b88272c2983c679bf0ff


public interface TripService extends WorkDiv<TripVO> {

    //단건 조회 + 조회수 증가
    TripVO upDoSelectOne(TripVO param);
<<<<<<< HEAD
=======
    // DB 내 중복 없는 태그 목록 조회 (동적 테마용)
    List<String> getDistinctTags();
    
>>>>>>> 6b42e8f5a0cab4098e44b88272c2983c679bf0ff
}
