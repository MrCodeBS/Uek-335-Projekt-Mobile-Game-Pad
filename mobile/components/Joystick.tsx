import React, { useRef } from 'react';
import { View, StyleSheet, PanResponder, Animated } from 'react-native';

type JoystickProps = {
  size?: number;
  onMove: (x: number, y: number) => void;
  onRelease: () => void;
};

export default function Joystick({
  size = 150,
  onMove,
  onRelease,
}: JoystickProps) {
  const pan = useRef(new Animated.ValueXY()).current;
  const maxRadius = size / 2.5;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        let newX = gestureState.dx;
        let newY = gestureState.dy;

        const distance = Math.sqrt(newX * newX + newY * newY);
        if (distance > maxRadius) {
          const angle = Math.atan2(newY, newX);
          newX = Math.cos(angle) * maxRadius;
          newY = Math.sin(angle) * maxRadius;
        }

        pan.setValue({ x: newX, y: newY });

        // Normalize [-1, 1]
        onMove(newX / maxRadius, newY / maxRadius);
      },
      onPanResponderRelease: () => {
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
          friction: 5,
        }).start();
        onRelease();
      },
    })
  ).current;

  return (
    <View style={[styles.base, { width: size, height: size, borderRadius: size / 2 }]}>
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.thumb,
          {
            width: size * 0.4,
            height: size * 0.4,
            borderRadius: (size * 0.4) / 2,
            transform: [{ translateX: pan.x }, { translateY: pan.y }],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: '#e5e5ea', // standard iOS light gray
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#d1d1d6',
  },
  thumb: {
    backgroundColor: '#ffffff', // standard white knob
    borderWidth: 1,
    borderColor: '#c7c7cc',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
});
