import React from 'react';
import { render } from '@testing-library/react-native';
import { AcademyCard } from '../src/components/AcademyCard';

const mockAcademy = {
  id: 'a1',
  name: '강남수학학원',
  address: '서울 강남구 테헤란로 123',
  subjects: ['수학'],
  monthlyFee: 300000,
  phone: '02-1234-5678',
  hasTimetable: true,
  distance_m: 350,
  timeSlots: [{ dayOfWeek: 'mon', startTime: '16:00', endTime: '18:00' }],
};

describe('AcademyCard', () => {
  it('학원 이름을 표시한다', () => {
    const { getByText } = render(<AcademyCard academy={mockAcademy} />);
    expect(getByText('강남수학학원')).toBeTruthy();
  });

  it('거리를 미터 단위로 표시한다', () => {
    const { getByText } = render(<AcademyCard academy={mockAcademy} />);
    expect(getByText('350m')).toBeTruthy();
  });

  it('월 수강료를 만원 단위로 표시한다', () => {
    const { getByText } = render(<AcademyCard academy={mockAcademy} />);
    expect(getByText('30만원/월')).toBeTruthy();
  });

  it('시간표가 없으면 안내 문구를 표시한다', () => {
    const noTimetable = { ...mockAcademy, hasTimetable: false, timeSlots: [] };
    const { getByText } = render(<AcademyCard academy={noTimetable} />);
    expect(getByText('시간표 정보 없음')).toBeTruthy();
  });
});
