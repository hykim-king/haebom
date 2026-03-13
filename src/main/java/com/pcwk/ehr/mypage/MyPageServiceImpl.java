package com.pcwk.ehr.mypage;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;


import com.pcwk.ehr.cmn.DTO;
import com.pcwk.ehr.domain.TripVO;
import com.pcwk.ehr.domain.UserVO;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class MyPageServiceImpl implements MyPageService {

    @Autowired
    private MyPageMapper myPageMapper;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

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
    public int nickCheck(String userNick) {
        return myPageMapper.nickCheck(userNick);
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
    public int updatePassword(UserVO vo, String newPw) {
        // 1. DB에서 현재 암호화된 비밀번호 가져오기
        // doSelectOne(int)가 아니라 doSelectOne(UserVO)를 호출해야 하므로 객체 생성
        UserVO searchVO = new UserVO();
        searchVO.setUserNo(vo.getUserNo());

        // 인터페이스 규격에 맞춰 객체를 전달합니다.
        UserVO dbUser = myPageMapper.doSelectOne(searchVO);

        // 2. 사용자가 입력한 '현재 비밀번호'와 DB 비번 비교
        if (dbUser == null || !passwordEncoder.matches(vo.getUserEnpswd(), dbUser.getUserEnpswd())) {
            return -1; // 비밀번호 불일치 혹은 유저 없음
        }

        // 3. 새 비밀번호 암호화 후 업데이트
        vo.setUserEnpswd(passwordEncoder.encode(newPw));
        return myPageMapper.doUpdatePw(vo);
    }

    @Override
    public List<TripVO> getRelationList(int userNo, int relClsf) {
        return myPageMapper.getRelationList(userNo, relClsf);
    }

    @Override
    public int getRelationCount(int userNo, int relClsf) {
        return myPageMapper.getRelationCount(userNo, relClsf);
    }

    @Override
    public int deleteRelation(int userNo, int relClsf,Integer tripContsId) {
        return myPageMapper.deleteRelation(userNo, relClsf,tripContsId);
    }

}