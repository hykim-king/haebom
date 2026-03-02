# 해봄 (Haebom) 프로젝트 폴더 구조

## 전체 구조
```
src/main/java/com/pcwk/ehr/
├── HaebomApplication.java          # Spring Boot 메인 실행 클래스
│
├── cmn/                             # 공통 클래스
│   ├── DTO.java                     # 페이징 등 공통 필드를 가진 부모 클래스
│   └── WorkDiv.java                 # 작업 구분 관련 클래스
│
├── config/                          # 설정
│   ├── DataSourceConfig.java        # DB 연결 설정
│   ├── LocaleConfig.java            # 다국어 설정
│   ├── MyBatisConfig.java           # MyBatis 설정
│   └── SecurityConfig.java          # Spring Security 설정
│
├── domain/                          # VO (Value Object) 모음
│   ├── UserVO.java                  # 사용자
│   ├── HospitalVO.java              # 병원
│   ├── DrugVO.java                  # 약국
│   ├── TripVO.java                  # 여행지
│   ├── TripDetailVO.java            # 여행지 상세
│   ├── CourseVO.java                # 여행코스
│   ├── CourseTripVO.java            # 코스-여행지 순서
│   ├── CommentVO.java               # 댓글
│   ├── ReportVO.java                # 신고
│   ├── SupportVO.java               # 문의사항
│   ├── NoticeVO.java                # 공지사항
│   ├── AttachFileVO.java            # 첨부파일
│   ├── RelationVO.java              # 관계 (찜/좋아요)
│   └── AreaVO.java                  # 지역
│
├── user/                            # 사용자 기능
├── hospital/                        # 병원 기능
├── drug/                            # 약국 기능
├── trip/                            # 여행지 + 여행지 상세 기능
├── course/                          # 여행코스 + 코스-여행지 순서 기능
├── comment/                         # 댓글 기능
├── report/                          # 신고 기능
├── support/                         # 문의사항 기능
├── notice/                          # 공지사항 기능
├── attachfile/                      # 첨부파일 기능
├── relation/                        # 관계 (찜/좋아요) 기능
└── area/                            # 지역 기능
```

## 기능 폴더 안에 들어갈 파일 구성
각 기능 폴더는 아래 패턴으로 구성됩니다. (hospital 폴더 참고)

```
hospital/
├── HospitalController.java          # 컨트롤러 - 요청/응답 처리
├── HospitalService.java             # 서비스 인터페이스
├── HospitalServiceImpl.java         # 서비스 구현체 - 비즈니스 로직
└── HospitalMapper.java              # 매퍼 인터페이스 - DB 접근
```

## 리소스 구조
```
src/main/resources/
├── application.properties            # 프로젝트 설정
├── mapper/                           # MyBatis SQL XML 파일
│   ├── UserMapper.xml
│   ├── HospitalMapper.xml
│   └── CommentMapper.xml
└── templates/                        # 화면 템플릿
    └── index.html
```

## 참고사항
- **trip** 폴더에 여행지(Trip) + 여행지 상세(TripDetail) 기능이 함께 들어갑니다
- **course** 폴더에 여행코스(Course) + 코스-여행지 순서(CourseTrip) 기능이 함께 들어갑니다
- VO 클래스는 모두 **domain** 폴더에 모아둡니다
- Mapper XML 파일은 **resources/mapper/** 에 위치합니다

---

## 코드 메뉴얼

### 1. VO (Value Object) 작성 규칙
- 모든 VO는 `domain` 패키지에 위치
- `DTO` 클래스를 상속받아야 함 (페이징, 검색 필드 포함)
- Lombok 어노테이션 사용

```java
package com.pcwk.ehr.domain;

import com.pcwk.ehr.cmn.DTO;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@ToString(callSuper = true)
@EqualsAndHashCode(callSuper = true)
public class ExampleVO extends DTO {

    private int    exNo;      // 고유번호
    private String exNm;      // 이름
}
```

### 2. Mapper 인터페이스 작성 규칙
- 기능 폴더 안에 위치 (ex: `hospital/HospitalMapper.java`)
- `@Mapper` 어노테이션 필수
- `WorkDiv<T>` 인터페이스를 상속 (기본 CRUD 메서드 제공)
- 추가 메서드가 필요하면 인터페이스에 선언

```java
@Mapper
public interface ExampleMapper extends WorkDiv<ExampleVO> {

    int deleteAll();
    int getCount();
}
```

#### WorkDiv<T>가 제공하는 기본 메서드
| 메서드                    | 설명               | 반환값          |
|---------------------------|--------------------| ----------------|
| `doRetrieve(DTO param)`   | 목록 조회 (페이징) | `List<T>`       |
| `doSelectOne(T param)`    | 단건 조회          | `T`             |
| `doSave(T param)`         | 등록               | 성공(1)/실패(0) |
| `doUpdate(T param)`       | 수정               | 성공(1)/실패(0) |
| `doDelete(T param)`       | 삭제               | 성공(1)/실패(0) |

### 3. Service 작성 규칙
- 인터페이스 + 구현체 분리 (`ExampleService` / `ExampleServiceImpl`)
- `WorkDiv<T>`를 상속
- 구현체에 `@Service`, `@RequiredArgsConstructor` 사용
- 사용하지 않는 메서드는 `throw new UnsupportedOperationException()` 처리

```java
// 인터페이스
public interface ExampleService extends WorkDiv<ExampleVO> {
}

// 구현체
@Service
@RequiredArgsConstructor
public class ExampleServiceImpl implements ExampleService {

    private final ExampleMapper exampleMapper;

    @Override
    public List<ExampleVO> doRetrieve(DTO param) {
        return exampleMapper.doRetrieve(param);
    }

    @Override
    public int doSave(ExampleVO param) {
        throw new UnsupportedOperationException();
    }
    // ...
}
```

### 4. Mapper XML 작성 규칙
- `resources/mapper/` 폴더에 위치
- namespace는 Mapper 인터페이스의 전체 경로
- **parameterType, resultType은 alias 사용** (ex: `HospitalVO`, `DTO`)
- **SQL 컬럼명은 대문자로 작성**
- 비교연산자(`<=`, `>=`)는 **CDATA로 감싸기**

```xml
<mapper namespace="com.pcwk.ehr.example.ExampleMapper">

    <select id="doSelectOne" parameterType="ExampleVO" resultType="ExampleVO">
        SELECT
            EX_NO,
            EX_NM
        FROM example
        WHERE EX_NO = #{exNo}
    </select>
</mapper>
```

### 5. 검색 조건 (searchDiv) 번호 규칙
| 번호 | 검색 대상   |
|------|-------------|
| `10` | 이름 (NM)   |
| `20` | 주소 (ADDR) |

### 6. 네이밍 규칙
| 구분           | 규칙                 | 예시                             |
|----------------|----------------------|----------------------------------|
| DB 컬럼        | 대문자 + 언더스코어  | `HP_NO`, `HP_NM`                 |
| Java 필드      | camelCase            | `hpNo`, `hpNm`                   |
| 테이블 접두어  | 기능 약어            | `HP_` (병원), `CMT_` (댓글)      |
| 메서드명       | do + 동작            | `doSave`, `doRetrieve`           |

### 7. 테스트 코드 작성 규칙
- `@SpringBootTest` 사용
- `@BeforeEach`에서 `deleteAll()` 후 테스트 데이터 세팅
- `@DisplayName`으로 한글 테스트명 작성
- 테스트 순서: 데이터 등록 → 실행 → 결과 확인

```java
@SpringBootTest
class ExampleDaoTest {

    @Autowired
    ExampleMapper exampleMapper;

    @BeforeEach
    void setUp() {
        exampleMapper.deleteAll();
        // 테스트 데이터 세팅
    }

    @Test
    @DisplayName("등록")
    void doSave() {
        // 1. 전체 건수 조회
        // 2. 등록
        // 3. 등록 확인
    }
}
```

---

## Git 커밋 메시지 규칙

### 형식
```
타입: 작업내용
```

### 타입
| 타입       | 설명                           | 예시                                   |
|------------|--------------------------------|----------------------------------------|
| `feat`     | 새로운 기능 추가               | `feat: 병원 목록 조회 구현`            |
| `fix`      | 버그 수정                      | `fix: 병원 단건 조회 NPE 수정`         |
| `refactor` | 코드 리팩토링 (기능 변화 없음) | `refactor: HospitalService 구조 개선`  |
| `test`     | 테스트 코드 추가/수정          | `test: 병원 doRetrieve 테스트 추가`    |
| `docs`     | 문서 수정                      | `docs: README 코드 메뉴얼 추가`       |
| `setting`  | 설정 파일 변경                 | `setting: MyBatis alias 경로 수정`     |
| `style`    | 코드 포맷팅, 세미콜론 등       | `style: SQL 컬럼명 대문자 변경`        |
