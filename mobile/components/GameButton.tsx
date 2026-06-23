import React, { useState } from 'react';
import {
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

type GameButtonProps = {
  label?: string;
  icon?: React.ReactNode;
  color?: string;
  textColor?: string;
  size?: number;
  round?: boolean;
  onPress: () => void;
  onRelease: () => void;
};

export default function GameButton({
  label,
  icon,
  color = '#e0e0e0', // basic gray
  textColor = '#007AFF', // standard iOS blue
  size = 56,
  round = false,
  onPress,
  onRelease,
}: GameButtonProps) {
  const [pressed, setPressed] = useState(false);

  const handlePressIn = () => {
    setPressed(true);
    onPress();
  };

  const handlePressOut = () => {
    setPressed(false);
    onRelease();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.6}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.button,
        {
          width: size,
          height: size,
          backgroundColor: pressed ? '#d1d1d6' : color,
          borderRadius: round ? size / 2 : 8,
        },
      ]}
    >
      {icon ? (
        icon
      ) : (
        <Text
          style={[
            styles.label,
            { color: textColor, fontSize: size > 50 ? 18 : 14 },
          ]}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#c7c7cc',
  },
  label: {
    fontWeight: '600',
  },
});
