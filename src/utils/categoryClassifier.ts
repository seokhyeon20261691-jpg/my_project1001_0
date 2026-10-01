import { CategoryDef, CategoryId, TransactionType } from '../types/ledger';

export const CATEGORIES: Record<CategoryId, CategoryDef> = {
  food: {
    id: 'food',
    name: '식비',
    type: 'expense',
    iconName: 'Utensils',
    description: '식당, 배달음식, 반찬, 간편식 등',
  },
  cafe: {
    id: 'cafe',
    name: '카페/디저트',
    type: 'expense',
    iconName: 'Coffee',
    description: '커피, 베이커리, 디저트, 음료 등',
  },
  mart: {
    id: 'mart',
    name: '생활/마트',
    type: 'expense',
    iconName: 'ShoppingCart',
    description: '대형마트, 편의점, 생활필수품, 식자재 등',
  },
  shopping: {
    id: 'shopping',
    name: '쇼핑/의류',
    type: 'expense',
    iconName: 'ShoppingBag',
    description: '의류, 신발, 잡화, 전자제품, 화장품 등',
  },
  transport: {
    id: 'transport',
    name: '교통/차량',
    type: 'expense',
    iconName: 'Car',
    description: '지하철, 버스, 택시, 주유, 주차비, 통행료 등',
  },
  housing: {
    id: 'housing',
    name: '주거/통신',
    type: 'expense',
    iconName: 'Home',
    description: '월세, 관리비, 수도/전기/가스 요금, 통신비 등',
  },
  health: {
    id: 'health',
    name: '의료/건강',
    type: 'expense',
    iconName: 'Activity',
    description: '병원, 약국, 치과, 피트니스, 영양제 등',
  },
  leisure: {
    id: 'leisure',
    name: '문화/여가',
    type: 'expense',
    iconName: 'Film',
    description: '영화, OTT 구독, 여행, 도서, 게임, 취미 등',
  },
  education: {
    id: 'education',
    name: '교육/학습',
    type: 'expense',
    iconName: 'BookOpen',
    description: '강의, 학원비, 교재, 자격증 응시료 등',
  },
  finance: {
    id: 'finance',
    name: '금융/경조사',
    type: 'expense',
    iconName: 'CreditCard',
    description: '보험료, 대출이자, 축의금, 부의금, 모임회비 등',
  },
  salary: {
    id: 'salary',
    name: '급여/월급',
    type: 'income',
    iconName: 'Briefcase',
    description: '본업 급여, 상여금, 기본급 등',
  },
  side_income: {
    id: 'side_income',
    name: '부수입/알바',
    type: 'income',
    iconName: 'TrendingUp',
    description: '프리랜서, 아르바이트, 부업 수익 등',
  },
  allowance: {
    id: 'allowance',
    name: '용돈/금융소득',
    type: 'income',
    iconName: 'Gift',
    description: '용돈, 배당금, 예금 이자, 환급금, 중고판매 등',
  },
  other: {
    id: 'other',
    name: '기타',
    type: 'expense',
    iconName: 'MoreHorizontal',
    description: '분류되지 않은 지출 및 수입',
  },
};

// Keyword mapping for Korean merchants and common expressions
const KEYWORD_RULES: { keywords: string[]; category: CategoryId; inferredType?: TransactionType }[] = [
  // Income rules
  {
    keywords: ['급여', '월급', '기본급', '상여', '상여금', '보너스', '페이', '월급날', '정산금'],
    category: 'salary',
    inferredType: 'income',
  },
  {
    keywords: ['알바', '아르바이트', '부수입', '프리랜서', '원고료', '자문료', '외주', '강의료', '인센티브', '수당'],
    category: 'side_income',
    inferredType: 'income',
  },
  {
    keywords: ['용돈', '배당', '배당금', '이자', '환급', '연말정산', '당근', '당근마켓', '중고나라', '번개장터', '판매대금', '세금환급', '캐시백', '포인트환급'],
    category: 'allowance',
    inferredType: 'income',
  },

  // Cafe & Dessert
  {
    keywords: [
      '스타벅스', '스벅', '투썸', '투썸플레이스', '메가커피', '컴포즈', '빽다방', '이디야', '폴바셋', '할리스',
      '엔제리너스', '블루보틀', '커피빈', '텐퍼센트', '매머드', '아메리카노', '라떼', '에스프레소', '카푸치노',
      '카페', '커피', '원두', '베이커리', '빵집', '파리바게뜨', '파리바게트', '뚜레쥬르', '성심당', '런던베이글',
      '배스킨라빈스', '베스킨', '설빙', '공차', '버블티', '케이크', '마카롱', '도넛', '노티드', '디저트', '와플', '크로플'
    ],
    category: 'cafe',
    inferredType: 'expense',
  },

  // Food & Dining
  {
    keywords: [
      '배달의민족', '배민', '요기요', '쿠팡이츠', '식당', '식사', '점심', '저녁', '아침', '밥집', '구내식당',
      '김밥', '분식', '떡볶이', '라면', '순대', '튀김', '돈까스', '돈가스', '초밥', '스시', '국밥', '순대국',
      '삼겹살', '고기', '갈비', '한우', '정육', '치킨', '교촌', 'bbq', 'bhc', '굽네', '피자', '도미노', '피자헛',
      '버거킹', '맥도날드', '맘스터치', '롯데리아', '서브웨이', '햄버거', '마라탕', '양꼬치', '중국집', '짜장면', '짬뽕',
      '탕수육', '백반', '된장찌개', '김치찌개', '찌개', '칼국수', '우동', '냉면', '파스타', '스테이크', '레스토랑',
      '포차', '술집', '맥주', '소주', '와인', '안주', '회식', '족발', '보쌈', '샤브샤브'
    ],
    category: 'food',
    inferredType: 'expense',
  },

  // Mart & Living
  {
    keywords: [
      '이마트', '홈플러스', '롯데마트', '트레이더스', '코스트코', '하나로마트', '다이소', '노브랜드',
      '편의점', 'cu', 'gs25', '세븐일레븐', '이마트24', '미니스톱', '장보기', '마트', '슈퍼', '식료품',
      '생필품', '세제', '휴지', '쓰레기봉투', '세탁세제', '칫솔', '치약', '비누', '샴푸', '린스', '수건'
    ],
    category: 'mart',
    inferredType: 'expense',
  },

  // Shopping & Clothing
  {
    keywords: [
      '쿠팡', '네이버페이', '네이버쇼핑', '무신사', '지그재그', '에이블리', '29cm', '올리브영', '백화점',
      '신세계', '현대백화점', '롯데백화점', '아울렛', '11번가', 'g마켓', '지마켓', '옥션', '알리', '알리익스프레스',
      '테무', '자라', '유니클로', 'h&m', '스파오', '탑텐', '옷', '신발', '의류', '패딩', '코트', '셔츠', '바지',
      '운동화', '가방', '화장품', '향수', '아이폰', '갤럭시', '에어팟', '전자기기', '애플'
    ],
    category: 'shopping',
    inferredType: 'expense',
  },

  // Transport & Car
  {
    keywords: [
      '지하철', '버스', '택시', '카카오택시', '카카오t', '티머니', '캐시비', '교통카드', 'ktx', 'srt',
      '코레일', '기차', '고속버스', '시외버스', '주유', '주유소', 'gs칼텍스', 'sk에너지', '에쓰오일', 's-oil',
      '현대오일뱅크', '하이패스', '주차', '주차장', '모두의주차장', '통행료', '대리운전', '세차', '엔진오일',
      '따릉이', '킥보드', '지쿠터', '빔', '씽씽', '항공권', '비행기'
    ],
    category: 'transport',
    inferredType: 'expense',
  },

  // Housing & Utilities & Telecom
  {
    keywords: [
      '월세', '관리비', '아파트관리비', '전기요금', '전기세', '수도요금', '수도세', '가스비', '도시가스',
      '난방비', '통신비', '핸드폰요금', '휴대폰요금', 'skt', 'kt', 'lgu+', 'lg유플러스', '알뜰폰', '인터넷',
      '와이파이', '부동산', '중개수수료', '집수리', '인테리어', '가구'
    ],
    category: 'housing',
    inferredType: 'expense',
  },

  // Health & Medical
  {
    keywords: [
      '병원', '의원', '내과', '치과', '이비인후과', '정형외과', '안과', '피부과', '한의원', '약국', '처방전',
      '진료비', '검진', '건강검진', '영양제', '비타민', '유산균', '마스크', '헬스', '헬스장', '피트니스',
      '필라테스', '요가', 'pt', '크로스핏', '수영장'
    ],
    category: 'health',
    inferredType: 'expense',
  },

  // Leisure & Culture
  {
    keywords: [
      '넷플릭스', '유튜브', '유튜브프리미엄', '왓챠', '티빙', '디즈니', '디즈니플러스', '웨이브', '쿠팡플레이',
      '스포티파이', '멜론', '지니뮤직', '애플뮤직', 'cgv', '롯데시네마', '메가박스', '영화', '영화관',
      '도서', '교보문고', 'yes24', '예스24', '알라딘', '밀리의서재', '리디북스', '책', '만화카페',
      '게임', '스팀', 'steam', '닌텐도', '플레이스테이션', 'pc방', '노래방', '코인노래방', '골프', '스크린골프',
      '볼링', '호텔', '숙박', '펜션', '에어비앤비', '야놀자', '여기어때', '여행', '전시회', '뮤지컬', '공연', '콘서트'
    ],
    category: 'leisure',
    inferredType: 'expense',
  },

  // Education
  {
    keywords: [
      '학원', '강의', '인강', '수강료', '클래스101', '패스트캠퍼스', '유데미', '인프런', '토익', '오픽',
      '토플', '자격증', '시험', '응시료', '학습지', '과외', '독서실', '스터디카페'
    ],
    category: 'education',
    inferredType: 'expense',
  },

  // Finance & Celebrations
  {
    keywords: [
      '보험', '보험료', '실손', '생명보험', '암보험', '자동차보험', '대출', '대출이자', '이자', '상환',
      '적금', '청약', '축의금', '결혼식', '부의금', '조의금', '장례식', '선물', '회비', '모임비', '곗돈', '기부금'
    ],
    category: 'finance',
    inferredType: 'expense',
  },
];

/**
 * Classifies an input text into a category and optional inferred transaction type.
 */
export function classifyCategory(text: string): {
  categoryId: CategoryId;
  categoryDef: CategoryDef;
  matchedKeyword?: string;
  inferredType?: TransactionType;
} {
  const normalized = text.toLowerCase().trim();

  if (!normalized) {
    return {
      categoryId: 'other',
      categoryDef: CATEGORIES.other,
    };
  }

  for (const rule of KEYWORD_RULES) {
    for (const kw of rule.keywords) {
      if (normalized.includes(kw.toLowerCase())) {
        return {
          categoryId: rule.category,
          categoryDef: CATEGORIES[rule.category],
          matchedKeyword: kw,
          inferredType: rule.inferredType,
        };
      }
    }
  }

  return {
    categoryId: 'other',
    categoryDef: CATEGORIES.other,
  };
}
