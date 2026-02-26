// Culture Detail Logic

// Reuse Data from culture.js (Ideally this should be a shared module or API)
const MOCK_CULTURE_DATA = [
    {
        id: 1,
        name: '국립현대미술관 서울',
        region: '서울',
        category: '미술관',
        address: '서울특별시 종로구 삼청로 30',
        image: 'https://images.unsplash.com/photo-1720270241567-a21eda1d5fc9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrb3JlYSUyMG11c2V1bSUyMGFydCUyMGdhbGxlcnklMjBleHRlcmlvciUyMGFyY2hpdGVjdHVyZSUyMG1vZGVybnxlbnwxfHx8fDE3NzA4MDc0ODB8MA&ixlib=rb-4.1.0&q=80&w=1080',
        desc: `국립현대미술관 서울은 동시대 미술의 흐름을 보여주는 한국의 대표 미술관입니다.
        
        과거 국군기무사령부 터에 건립된 서울관은 역사적 맥락을 현대적으로 재해석한 건축미가 돋보입니다. 전시실뿐만 아니라 디지털정보실, 멀티프로젝트홀, 영화관 등 다양한 문화 시설을 갖추고 있습니다.

        도심 속에서 예술을 즐기며 휴식을 취할 수 있는 열린 공간으로, 국내외 유수의 현대미술 작품을 감상할 수 있습니다.`,
    },
    {
        id: 2,
        name: '경복궁',
        region: '서울',
        category: '궁궐/유적',
        address: '서울특별시 종로구 사직로 161',
        image: 'https://images.unsplash.com/photo-1712617130426-ecdb768997b6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrb3JlYSUyMHBhbGFjZSUyMHRyYWRpdGlvbmFsJTIwYnVpbGRpbmclMjBzcHJpbmclMjBmbG93ZXJzfGVufDF8fHx8MTc3MDgwNzQ4NHww&ixlib=rb-4.1.0&q=80&w=1080',
        desc: `조선 왕조 제일의 법궁인 경복궁은 1395년 태조 이성계에 의해 창건되었습니다. '새 왕조가 큰 복을 누려 번영할 것'이라는 의미를 담고 있습니다.

        근정전, 경회루 등 아름다운 전각들이 조화를 이루며 한국 전통 건축의 정수를 보여줍니다. 사계절 변화하는 궁궐의 풍경은 방문객들에게 깊은 감동을 선사합니다.

        야간 개장 기간에는 은은한 조명 아래 더욱 고즈넉한 궁궐의 정취를 느낄 수 있습니다.`,
    },
    {
        id: 3,
        name: '부산시립미술관',
        region: '부산',
        category: '미술관',
        address: '부산광역시 해운대구 APEC로 58',
        image: 'https://images.unsplash.com/photo-1768726455737-3e55a8268bf0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnQlMjBnYWxsZXJ5JTIwaW50ZXJpb3IlMjBleGhpYml0aW9uJTIwY2xlYW4lMjBtaW5pbWFsfGVufDF8fHx8MTc3MDgwNzQ4OHww&ixlib=rb-4.1.0&q=80&w=1080',
        desc: '부산의 현대미술을 조명하고 시민들에게 다양한 문화 체험 기회를 제공합니다. 이우환 공간 등 세계적인 작가의 작품도 만나볼 수 있습니다.'
    },
    {
        id: 4,
        name: '아르떼뮤지엄 강릉',
        region: '강원',
        category: '전시관',
        address: '강원도 강릉시 난설헌로 131',
        image: 'https://images.unsplash.com/photo-1497211419994-142331908abd?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
        desc: '몰입형 미디어아트 상설 전시관으로, 강원도의 아름다운 자연을 모티브로 한 빛과 소리의 예술을 경험할 수 있습니다.'
    },
    {
        id: 5,
        name: '제주도립미술관',
        region: '제주',
        category: '미술관',
        address: '제주특별자치도 제주시 1100로 2894-78',
        image: 'https://images.unsplash.com/photo-1544967082-d9d25d867d66?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
        desc: '제주의 아름다운 자연 속에 위치한 미술관입니다. 물에 비친 미술관 건물의 반영이 특히 유명하며, 제주 미술의 현재를 보여주는 전시가 열립니다.'
    },
    {
        id: 6,
        name: '국립경주박물관',
        region: '경북',
        category: '박물관',
        address: '경상북도 경주시 일정로 186',
        image: 'https://images.unsplash.com/photo-1590423011388-755e10dc9725?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
        desc: '신라 천년의 수도였던 경주의 역사와 문화를 집대성한 곳입니다. 금관, 성덕대왕신종 등 국보급 문화재를 다수 소장하고 있습니다.'
    }
];

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = parseInt(urlParams.get('id'));

    const item = MOCK_CULTURE_DATA.find(d => d.id === id) || MOCK_CULTURE_DATA[0];

    if (item) {
        // Set Titles
        document.title = `${item.name} - 해봄트립`;
        
        // Fill Data
        document.getElementById('detail-image').src = item.image;
        document.getElementById('detail-name').textContent = item.name;
        document.getElementById('detail-category').textContent = item.category;
        document.getElementById('detail-address-hero').textContent = item.region;
        document.getElementById('detail-address-box').textContent = item.address;
        document.getElementById('detail-desc').textContent = item.desc;
    }

    if (typeof lucide !== 'undefined') lucide.createIcons();
});