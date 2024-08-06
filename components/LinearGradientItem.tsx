// components/LinearGradientItem.tsx
import { Day } from "@/app/(tabs)/rutina";
import { LinearGradient } from "expo-linear-gradient";
import { ViewStyle } from "react-native";

interface LinearGradientItemProps {
  styles: {
    dayContainer: ViewStyle;
    activeContainer?: ViewStyle;
    restDayContainer?: ViewStyle;
  };
  day?: Day;
  isActive?: boolean;
  children: React.ReactNode;
}

const LinearGradientItem = ({
  styles,
  day,
  isActive,
  children,
}: LinearGradientItemProps) => {
  return (
    <LinearGradient
      colors={["#06041a", "#526080", "#06041a"]}
      locations={[0, 0.5, 1]}
      start={{ x: -0.3, y: 0 }}
      end={{ x: 1.3, y: 1 }}
      style={[
        styles.dayContainer,
        day?.rest && styles.restDayContainer,
        isActive && styles.activeContainer,
      ]}
      testID="linear-gradient-item"
    >
      {children}
    </LinearGradient>
  );
};

export default LinearGradientItem;
