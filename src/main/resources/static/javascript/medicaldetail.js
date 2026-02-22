// Medical Detail Logic

// --- Constants (Must match medical.js logic for consistency) ---
const REGIONS = ['전체', '서울', '경기', '인천', '강원', '제주', '부산', '대구', '광주', '대전'];
const NAMES_HOSPITAL = ['서울대학교병원', '세브란스병원', '아산병원', '삼성서울병원', '성모병원', '밝은안과', '튼튼정형외과', '서울내과', '우리소아과', '굿모닝병원'];
const NAMES_PHARMACY = ['온누리약국', '종로약국', '행복약국', '건강약국', '세브란스약국', '대학약국', '메디칼약국', '옵티마약국', '백세약국', '푸른약국'];

const TAGS_HOSPITAL = ['응급실운영', '야간진료', '건강검진', '여의사', '주차가능', '입원실', '물리치료', '소아진료'];
const TAGS_PHARMACY = ['연중무휴', '심야약국', '동물약국', '처방조제', '상비약'];

// --- Helper Functions ---
function getParams() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    // Default to 'hospital-0' if no ID exists (Safety fallback for preview)
    return {
        id: id || 'hospital-0'
    };
}

// Deterministic random generator based on ID
function pseudoRandom(seed) {
    let x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}

function generateDetailData(id) {
    if (!id) return null;

    try {
        const parts = id.split('-');
        if (parts.length < 2) return null;

        const type = parts[0]; // 'hospital' or 'pharmacy'
        const index = parseInt(parts[1], 10); // numeric index

        if (isNaN(index)) return null;

        // Use index to deterministically recreate data
        const regionIndex = Math.floor(pseudoRandom(index * 11) * (REGIONS.length - 1)) + 1;
        const region = REGIONS[regionIndex];
        
        const nameList = type === 'hospital' ? NAMES_HOSPITAL : NAMES_PHARMACY;
        const name = `${region} ${nameList[index % nameList.length]} ${Math.floor(index/10) + 1}호점`;
        
        const phoneMain = `02-${Math.floor(pseudoRandom(index * 22) * 9000) + 1000}-${Math.floor(pseudoRandom(index * 33) * 9000) + 1000}`;
        const phoneEmer = `02-${Math.floor(pseudoRandom(index * 44) * 9000) + 1000}-${Math.floor(pseudoRandom(index * 55) * 9000) + 1000}`; // Emergency Number
        
        const address = `${region} 어딘가로 ${Math.floor(pseudoRandom(index * 66) * 900) + 100}번길 ${index + 1}`;
        
        // Generate Tags Deterministically
        const pool = type === 'hospital' ? TAGS_HOSPITAL : TAGS_PHARMACY;
        const shuffled = [...pool].sort((a, b) => pseudoRandom(index + a.length) - 0.5);
        const tagCount = Math.floor(pseudoRandom(index * 77) * 3) + 2; // 2~4 tags
        const tags = shuffled.slice(0, tagCount);

        return {
            id: id,
            type: type,
            name: name,
            region: region,
            address: address,
            phoneMain: phoneMain,
            phoneEmer: phoneEmer,
            openTime: '09:00 - 18:00 (점심시간 12:30 - 13:30)',
            tags: tags
        };
    } catch (e) {
        console.error("Error generating data:", e);
        return null;
    }
}

// --- Rendering ---
function renderDetail() {
    const { id } = getParams();
    let data = generateDetailData(id);

    // Safety fallback: if data generation failed, force a default hospital
    if (!data) {
        console.warn('Invalid ID or data generation failed. Falling back to default.');
        data = generateDetailData('hospital-0');
    }

    if (!data) return; // Should not happen with fallback

    // 1. Basic Info
    document.title = `${data.name} - 상세 정보`;
    const breadcrumb = document.getElementById('breadcrumb-current');
    if(breadcrumb) breadcrumb.textContent = data.name;

    const detailName = document.getElementById('detail-name');
    if(detailName) detailName.textContent = data.name;

    const detailAddress = document.getElementById('detail-address');
    if(detailAddress) detailAddress.textContent = data.address;

    const detailTime = document.getElementById('detail-time');
    if(detailTime) detailTime.textContent = data.openTime;
    
    const mapCaption = document.getElementById('map-address-caption');
    if(mapCaption) mapCaption.textContent = data.address;

    // 2. Type Badge & Icon
    const badge = document.getElementById('detail-type-badge');
    const icon = document.getElementById('type-icon');
    
    if (badge && icon) {
        if (data.type === 'hospital') {
            badge.textContent = '병원';
            badge.className = 'inline-block px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 mb-3';
            icon.setAttribute('data-lucide', 'stethoscope');
        } else {
            badge.textContent = '약국';
            badge.className = 'inline-block px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 mb-3';
            icon.setAttribute('data-lucide', 'pill');
        }
    }

    // 3. Tags with Colors
    const tagContainer = document.getElementById('detail-tags');
    if (tagContainer) {
        tagContainer.innerHTML = data.tags.map(tag => {
            let styleClass = 'bg-slate-100 text-slate-600 border-slate-200'; // Default
            
            if (tag === '응급실운영' || tag === '심야약국') {
                styleClass = 'bg-red-50 text-red-600 border-red-100 ring-1 ring-red-100'; 
            } else if (tag === '야간진료') {
                styleClass = 'bg-purple-50 text-purple-600 border-purple-100 ring-1 ring-purple-100'; 
            } else if (tag === '연중무휴' || tag === '입원실') {
                styleClass = 'bg-blue-50 text-blue-600 border-blue-100'; 
            } else if (tag === '소아진료' || tag === '여의사') {
                styleClass = 'bg-orange-50 text-orange-600 border-orange-100'; 
            }

            return `<span class="px-3 py-1.5 rounded-lg text-sm font-bold border ${styleClass}">#${tag}</span>`;
        }).join('');
    }

    // 4. Phone Numbers Logic
    const phoneContainer = document.getElementById('phone-container');
    if (phoneContainer) {
        let phoneHTML = '';

        // Main Number (Always shown)
        phoneHTML += `
            <div>
                <p class="text-xs font-bold text-slate-400 mb-1">대표 전화</p>
                <p class="text-xl font-bold text-slate-900 tracking-tight">${data.phoneMain}</p>
            </div>
        `;

        // Emergency Number (Only for Hospitals)
        if (data.type === 'hospital') {
            phoneHTML += `
                <div class="mt-4 pt-4 border-t border-slate-100">
                    <p class="text-xs font-bold text-red-500 mb-1 flex items-center gap-1">
                        <i data-lucide="siren" class="w-3 h-3"></i> 응급의료센터
                    </p>
                    <p class="text-xl font-bold text-red-600 tracking-tight">${data.phoneEmer}</p>
                </div>
            `;
        }

        phoneContainer.innerHTML = phoneHTML;
    }

    // Refresh Icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// --- Init ---
document.addEventListener('DOMContentLoaded', () => {
    renderDetail();
});