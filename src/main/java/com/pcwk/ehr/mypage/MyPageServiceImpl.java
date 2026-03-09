package com.pcwk.ehr.mypage;

import java.util.HashMap;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.HashMap;

import com.pcwk.ehr.cmn.DTO;
import com.pcwk.ehr.domain.TripVO;
import com.pcwk.ehr.domain.UserVO;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class MyPageServiceImpl implements MyPageService {

    @Autowired
    private MyPageMapper myPageMapper;

    @Override
    public int doSave(UserVO userVO) {
        return myPageMapper.doSave(userVO);
    }

    @Override
    public int doUpdate(UserVO userVO) {
        throw new UnsupportedOperationException();
    }

    @Override
    public int doDelete(UserVO userVO) {

        return myPageMapper.doDelete(userVO);
    }

    @Override
    public UserVO doSelectOne(UserVO userVO) {
        return myPageMapper.doSelectOne(userVO);
    }

    @Override
    public List<UserVO> doRetrieve(DTO dto) {

        throw new UnsupportedOperationException();
    }

    @Override
    public int doUpdateNick(UserVO userVO) {
        return myPageMapper.doUpdateNick(userVO);
    }

    @Override
    public int doUpdateTag(UserVO userVO) {
        return myPageMapper.doUpdateTag(userVO);
    }

    @Override
    public int doUpdateAddr(UserVO userVO) {
        return myPageMapper.doUpdateAddr(userVO);
    }

    @Override
    public int doUpdatePw(UserVO userVO) {
        // controller 전에 암호화를 거쳐야 ?
        return myPageMapper.doUpdatePw(userVO);
    }

    @Override
    public List<UserVO> getRelationList(UserVO userVO) {
        return myPageMapper.getRelationList(userVO);
    }

    @Override
    public int getRelationCount(UserVO userVO) {
        return myPageMapper.getRelationCount(userVO);
    }

    @Override
    public int deleteRelation(UserVO userVO) {
        return myPageMapper.deleteRelation(userVO);
    }

    @Override
    public int doDeleteWish(Map<String, Object> paramMap) {
        // 💡 로깅을 통해 데이터가 잘 넘어왔는지 확인하면 디버깅이 편합니다.
        log.info("ServiceImpl doDeleteWish paramMap: {}", paramMap);

        // 매퍼 인터페이스도 Map을 받도록 수정했으므로 그대로 전달합니다.
        return myPageMapper.doDeleteWish(paramMap);
    }

}