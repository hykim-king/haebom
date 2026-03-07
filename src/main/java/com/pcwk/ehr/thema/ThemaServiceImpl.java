package com.pcwk.ehr.thema;

import com.pcwk.ehr.cmn.DTO;
import com.pcwk.ehr.domain.TripVO;
import com.pcwk.ehr.thema.ThemaMapper;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

@Service
public class ThemaServiceImpl implements ThemaService {

    private final Logger log = LogManager.getLogger(getClass());

    @Autowired
    private ThemaMapper themaMapper; // Mapper 주입

    @Override
    public int doSave(TripVO inVO) {
        log.info("┌──────────────────────────┐");
        log.info("│ doSave()                 │");
        log.info("└──────────────────────────┘");
        return 0;
    }

    @Override
    public int doDelete(TripVO inVO) {
        log.info("┌──────────────────────────┐");
        log.info("│ doDelete()               │");
        log.info("└──────────────────────────┘");
        return 0;
    }

    @Override
    public TripVO doSelectOne(TripVO inVO) {
        log.info("┌──────────────────────────┐");
        log.info("│ doSelectOne()            │");
        log.info("└──────────────────────────┘");
        return null;
    }

    @Override
    public int doUpdate(TripVO inVO) {
        log.info("┌──────────────────────────┐");
        log.info("│ doUpdate()               │");
        log.info("└──────────────────────────┘");
        return 0;
    }

    @Override
    public List<TripVO> doRetrieve(DTO inVO) {
        log.info("┌──────────────────────────┐");
        log.info("│ doRetrieve() 시작         │");
        log.info("└──────────────────────────┘");

        TripVO searchVO = (TripVO) inVO;

        String sortType = searchVO.getSearchWord();

        if (sortType == null || sortType.trim().isEmpty()) {
            sortType = "default";
        }

        if (searchVO.getTripTag() == null || searchVO.getTripTag().isEmpty()) {
            searchVO.setTripTag("0");
        }

        log.info("조회 파라미터 - 태그: {}, 정렬방식(searchWord필드빌림): {}", searchVO.getTripTag(), sortType);

        // 3. MyBatis Mapper 호출
        // XML에서 tripTag 문자열을 .split(',') 하여 처리하게 됩니다.
        List<TripVO> list = themaMapper.doRetrieve(searchVO);
        
        if(list != null) {
            log.info("조회된 목록 개수: {}", list.size());
        }
        
        return list;
    }

}