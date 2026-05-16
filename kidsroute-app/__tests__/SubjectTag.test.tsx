import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SubjectTag } from '../src/components/SubjectTag';

describe('SubjectTag', () => {
  it('과목명을 렌더링한다', () => {
    const { getByText } = render(
      <SubjectTag label="수학" selected={false} onPress={() => {}} />,
    );
    expect(getByText('수학')).toBeTruthy();
  });

  it('선택된 상태일 때 배경색이 다르다', () => {
    const { getByTestId } = render(
      <SubjectTag label="수학" selected={true} onPress={() => {}} />,
    );
    const tag = getByTestId('subject-tag');
    expect(tag.props.style).toEqual(
      expect.objectContaining({ backgroundColor: '#4F8EF7' }),
    );
  });

  it('onPress 콜백이 호출된다', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <SubjectTag label="영어" selected={false} onPress={onPress} />,
    );
    fireEvent.press(getByText('영어'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
