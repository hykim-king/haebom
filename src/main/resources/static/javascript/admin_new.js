
// 신고 데이터 (50개)
let reportsData = [
  { id: 1, type: 'spam', target: '댓글 #123', content: '광고성 게시물입니다', reporter: '김민수', date: '2024-03-18', status: 'pending' },
  { id: 2, type: 'abuse', target: '댓글 #456', content: '욕설이 포함되어 있습니다', reporter: '이지은', date: '2024-03-18', status: 'pending' },
  { id: 3, type: 'inappropriate', target: '게시물 #789', content: '부적절한 사진이 있습니다', reporter: '박준호', date: '2024-03-18', status: 'pending' },
  { id: 4, type: 'spam', target: '댓글 #234', content: '스팸 댓글입니다', reporter: '최서연', date: '2024-03-17', status: 'pending' },
  { id: 5, type: 'etc', target: '게시물 #567', content: '허위 정보가 포함되어 있습니다', reporter: '정우진', date: '2024-03-17', status: 'pending' },
  { id: 6, type: 'abuse', target: '댓글 #890', content: '비방 댓글입니다', reporter: '강민지', date: '2024-03-16', status: 'completed' },
  { id: 7, type: 'spam', target: '댓글 #345', content: '광고 링크가 포함되어 있습니다', reporter: '윤서준', date: '2024-03-15', status: 'completed' },
  { id: 8, type: 'inappropriate', target: '게시물 #678', content: '주제와 무관한 내용입니다', reporter: '한예린', date: '2024-03-14', status: 'completed' },
  { id: 9, type: 'spam', target: '댓글 #111', content: '홍보 댓글입니다', reporter: '조현우', date: '2024-03-18', status: 'pending' },
  { id: 10, type: 'abuse', target: '댓글 #222', content: '혐오 발언이 있습니다', reporter: '송하늘', date: '2024-03-17', status: 'pending' },
  { id: 11, type: 'inappropriate', target: '게시물 #333', content: '불쾌한 이미지입니다', reporter: '임도윤', date: '2024-03-16', status: 'pending' },
  { id: 12, type: 'etc', target: '댓글 #444', content: '사기 의심 댓글입니다', reporter: '장서윤', date: '2024-03-15', status: 'completed' },
  { id: 13, type: 'spam', target: '게시물 #555', content: '중복 게시물입니다', reporter: '홍지우', date: '2024-03-14', status: 'completed' },
  { id: 14, type: 'abuse', target: '댓글 #666', content: '인신공격 댓글입니다', reporter: '권민재', date: '2024-03-13', status: 'completed' },
  { id: 15, type: 'inappropriate', target: '게시물 #777', content: '성적인 내용이 있습니다', reporter: '배수아', date: '2024-03-12', status: 'completed' },
  { id: 16, type: 'spam', target: '댓글 #888', content: '불법 사이트 링크입니다', reporter: '안유진', date: '2024-03-11', status: 'completed' },
  { id: 17, type: 'abuse', target: '댓글 #999', content: '명예훼손 댓글입니다', reporter: '신동혁', date: '2024-03-10', status: 'completed' },
  { id: 18, type: 'etc', target: '게시물 #1010', content: '저작권 침해 의심', reporter: '오승민', date: '2024-03-18', status: 'pending' },
  { id: 19, type: 'spam', target: '댓글 #1111', content: '도박 사이트 홍보', reporter: '류지훈', date: '2024-03-17', status: 'pending' },
  { id: 20, type: 'inappropriate', target: '게시물 #1212', content: '폭력적인 내용', reporter: '서예은', date: '2024-03-16', status: 'pending' },
  { id: 21, type: 'abuse', target: '댓글 #1313', content: '차별적 발언', reporter: '전민석', date: '2024-03-15', status: 'completed' },
  { id: 22, type: 'spam', target: '댓글 #1414', content: '피싱 사이트 링크', reporter: '노수빈', date: '2024-03-14', status: 'completed' },
  { id: 23, type: 'etc', target: '게시물 #1515', content: '개인정보 노출', reporter: '하준영', date: '2024-03-13', status: 'completed' },
  { id: 24, type: 'inappropriate', target: '댓글 #1616', content: '불법 촬영물 공유', reporter: '문채원', date: '2024-03-12', status: 'completed' },
  { id: 25, type: 'spam', target: '게시물 #1717', content: '무단 영리 광고', reporter: '백시우', date: '2024-03-11', status: 'completed' },
  { id: 26, type: 'abuse', target: '댓글 #1818', content: '협박성 댓글', reporter: '양다은', date: '2024-03-18', status: 'pending' },
  { id: 27, type: 'inappropriate', target: '게시물 #1919', content: '미성년자 유해', reporter: '표민호', date: '2024-03-17', status: 'pending' },
  { id: 28, type: 'etc', target: '댓글 #2020', content: '테러 조장', reporter: '손유나', date: '2024-03-16', status: 'pending' },
  { id: 29, type: 'spam', target: '댓글 #2121', content: '다단계 홍보', reporter: '황재현', date: '2024-03-15', status: 'completed' },
  { id: 30, type: 'abuse', target: '게시물 #2222', content: '괴롭힘 행위', reporter: '곽서진', date: '2024-03-14', status: 'completed' },
  { id: 31, type: 'inappropriate', target: '댓글 #2323', content: '자살 조장', reporter: '남궁민', date: '2024-03-13', status: 'completed' },
  { id: 32, type: 'spam', target: '게시물 #2424', content: '불법 제품 판매', reporter: '제갈윤', date: '2024-03-12', status: 'completed' },
  { id: 33, type: 'etc', target: '댓글 #2525', content: '사칭 행위', reporter: '선우진', date: '2024-03-11', status: 'completed' },
  { id: 34, type: 'abuse', target: '게시물 #2626', content: '집단 괴롭힘', reporter: '독고영', date: '2024-03-10', status: 'completed' },
  { id: 35, type: 'inappropriate', target: '댓글 #2727', content: '동물 학대', reporter: '황보라', date: '2024-03-09', status: 'completed' },
  { id: 36, type: 'spam', target: '게시물 #2828', content: '무분별한 홍보', reporter: '사공민', date: '2024-03-08', status: 'completed' },
  { id: 37, type: 'abuse', target: '댓글 #2929', content: '종교 비방', reporter: '제강현', date: '2024-03-07', status: 'completed' },
  { id: 38, type: 'etc', target: '게시물 #3030', content: '정치 선동', reporter: '탁수진', date: '2024-03-06', status: 'completed' },
  { id: 39, type: 'inappropriate', target: '댓글 #3131', content: '혐오 표현', reporter: '도예림', date: '2024-03-05', status: 'completed' },
  { id: 40, type: 'spam', target: '게시물 #3232', content: '불법 다운로드 유도', reporter: '빈채연', date: '2024-03-04', status: 'completed' },
  { id: 41, type: 'abuse', target: '댓글 #3333', content: '성희롱 댓글', reporter: '석지훈', date: '2024-03-03', status: 'completed' },
  { id: 42, type: 'inappropriate', target: '게시물 #3434', content: '마약 관련 내용', reporter: '옥수아', date: '2024-03-02', status: 'completed' },
  { id: 43, type: 'etc', target: '댓글 #3535', content: '불법 도박 유도', reporter: '견우진', date: '2024-03-01', status: 'completed' },
  { id: 44, type: 'spam', target: '게시물 #3636', content: '가짜뉴스 유포', reporter: '설민지', date: '2024-02-29', status: 'completed' },
  { id: 45, type: 'abuse', target: '댓글 #3737', content: '지역 비하', reporter: '방혜린', date: '2024-02-28', status: 'completed' },
  { id: 46, type: 'inappropriate', target: '게시물 #3838', content: '유혈 낭자 이미지', reporter: '추재민', date: '2024-02-27', status: 'completed' },
  { id: 47, type: 'etc', target: '댓글 #3939', content: '해킹 유도', reporter: '경다현', date: '2024-02-26', status: 'completed' },
  { id: 48, type: 'spam', target: '게시물 #4040', content: '악성코드 배포', reporter: '목서윤', date: '2024-02-25', status: 'completed' },
  { id: 49, type: 'abuse', target: '댓글 #4141', content: '장애인 비하', reporter: '창민호', date: '2024-02-24', status: 'completed' },
  { id: 50, type: 'inappropriate', target: '게시물 #4242', content: '범죄 조장', reporter: '편수빈', date: '2024-02-23', status: 'completed' },
];

// ===================================
// 초기화 함수 - 페이지 로드 시 실행
// ===================================

const nowMonth = document.getElementById("nowMonth");
const statisticMonth = document.getElementById("statistic-month");
const statisticYear = document.getElementById("statistic-year");
const statisticType = document.getElementById("statistic-type");

document.addEventListener('DOMContentLoaded', function () {
  yearSelect();
  statisticsAjax();

  statisticType.addEventListener('change', function () {
    if(this.value === 'day'){
      statisticMonth.classList.remove('hidden');
    }else{
      statisticMonth.classList.add('hidden');
    }
  });

  nowMonth.addEventListener('click', function () {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    // 월 select 보이기
    statisticMonth.classList.remove('hidden');
    // 타입 선택
    statisticType.value = 'day';
    // 현재 년도 선택
    statisticYear.value = year;
    // 현재 월 선택
    statisticMonth.value = month;

    statisticsAjax();
  });
});


function yearSelect(){
  const yearSelect = document.getElementById("statistic-year");
  const currentYear = new Date().getFullYear();

  // 기존 옵션 제거
  yearSelect.innerHTML = "";

  // 현재년도 ~ 5년 전까지 생성
  for (let i = 0; i <= 5; i++) {
    const year = currentYear - i;

    const option = document.createElement("option");
    option.value = year;
    option.textContent = year + " 년";

    yearSelect.appendChild(option);
  }
}

function statisticsSearch(){
  statisticsAjax();
}
// ===================================
// 데이터 통계 - 차트 시각화
// ===================================

/**
 * 통계 섹션 초기화 (모든 차트 생성)
 */
function initStatistics() {
  initSignupChart();       // 회원가입자 수 차트
  initActivityChart();     // 활동 통계 차트
  initReportTypeChart();   // 신고 유형 분포 차트
}
let signupChartData = null; 
let activityChartData = null;
let reportTypeChartData = null;

function statisticsAjax() {
  const param = {
    type: statisticType.value,
    year: statisticYear.value,
    month: statisticMonth.value
  };

  const token = $('meta[name="_csrf"]').attr('content');
  const header = $('meta[name="_csrf_header"]').attr('content');

  $.ajax({
    url: "/admin/statisticData",
    type: "POST",
    data: param,
    dataType: "json",
    beforeSend: function (xhr) {
      xhr.setRequestHeader(header, token);
    },
    success: function(res) {
      if (res.result == 1) {
        signupChartData = res.signupChartData || [];
        activityChartData = res.activityChartData || [];
        reportTypeChartData = res.reportTypeChartData || [];

        initStatistics();
      } else {
        alert(res.message || "통계 데이터를 불러오지 못했습니다.");
      }
    },
    error: function(xhr) {
      let msg = "오류가 발생했습니다.";

      if (xhr.responseJSON && xhr.responseJSON.message) {
        msg += "\nmessage: " + xhr.responseJSON.message;
        msg += "\npath: " + xhr.responseJSON.path;
        msg += "\nstatus: " + xhr.responseJSON.status;
        msg += "\ndate: " + xhr.responseJSON.timestamp;
      }

      alert(msg);
    }
  });
}

/**
 * 회원가입자 수 차트 (라인 차트)
 * 최근 6개월 데이터 표시
 */
let signupChart = null;
let activityChart = null;
let reportTypeChart = null;

// let signupChartData = [];
// let activityChartData = [];
// let reportTypeChartData = [];

function initSignupChart() {
  const ctx = document.getElementById('signupChart');
  if (!ctx) return;

  const labels = [];
  const data = [];
  const today = new Date();

  const type = document.getElementById("statistic-type").value;
  const year = document.getElementById("statistic-year").value;
  const month = document.getElementById("statistic-month").value;

  const lastDay = new Date(year, month, 0).getDate();
  for (let i = 0; i < signupChartData.length; i++) {
    if(type === 'month'){
      labels.push(signupChartData[i].MONTH+'월');
    }else{
      labels.push(signupChartData[i].DAY+'일');
    }
    data.push(signupChartData[i].CNT);
  }
  if(type==='month'){
    document.querySelector(".card .card-header h5").textContent =`${year}년도 회원가입자 수`;
  }else{
    document.querySelector(".card .card-header h5").textContent =`${year}년 ${month}월 회원가입자 수`;
  }
  // console.log(labels);
  // console.log(data);

  if (signupChart) {
    signupChart.destroy();
  }

  signupChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: '회원가입자 수',
        data: data,
        borderColor: 'rgba(249, 115, 22, 1)',
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: 'rgba(249, 115, 22, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: true,
          position: 'top'
        },
        tooltip: {
          mode: 'index',
          intersect: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 20
          }
        }
      }
    }
  });
}

/**
 * 월별 활동 통계 차트 (막대 차트)
 * 이번 달과 지난 달 비교
 */
function initActivityChart() {
  const ctx = document.getElementById('activityChart');
  if (!ctx) return;

  if (activityChart) {
    activityChart.destroy();
  }

  const currentData = activityChartData.current || [245, 189, 567, 123];
  const previousData = activityChartData.previous || [198, 156, 489, 98];

  activityChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['댓글', '게시물', '좋아요', '공유'],
      datasets: [{
        label: '이번 달',
        data: currentData,
        backgroundColor: 'rgba(249, 115, 22, 0.8)',
        borderColor: 'rgba(249, 115, 22, 1)',
        borderWidth: 2,
        borderRadius: 8
      }, {
        label: '지난 달',
        data: previousData,
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: true,
          position: 'top'
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

/**
 * 신고 유형 분포 차트 (도넛 차트)
 */
function initReportTypeChart() {
  const ctx = document.getElementById('reportTypeChart');
  if (!ctx) return;

  if (reportTypeChart) {
    reportTypeChart.destroy();
  }

  let reportCounts = {
    spam: 0,
    abuse: 0,
    inappropriate: 0,
    etc: 0
  };

  if (reportTypeChartData.length > 0) {
    reportTypeChartData.forEach(item => {
      reportCounts[item.type] = item.count;
    });
  } else {
    reportsData.forEach(report => {
      reportCounts[report.type]++;
    });
  }

  reportTypeChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['스팸', '욕설/비방', '부적절한 내용', '기타'],
      datasets: [{
        data: [
          reportCounts.spam,
          reportCounts.abuse,
          reportCounts.inappropriate,
          reportCounts.etc
        ],
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(249, 115, 22, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(59, 130, 246, 0.8)'
        ],
        borderColor: [
          'rgba(239, 68, 68, 1)',
          'rgba(249, 115, 22, 1)',
          'rgba(139, 92, 246, 1)',
          'rgba(59, 130, 246, 1)'
        ],
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: true,
          position: 'bottom'
        }
      }
    }
  });
}
