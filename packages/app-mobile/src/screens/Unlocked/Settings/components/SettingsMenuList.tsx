import type { StyleProp, TextStyle, ViewStyle } from "react-native";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@hooks";

import { IconPushDetail, RoundedContainer, SettingsRow } from "./SettingsRow";

export function SettingsList({
  style,
  menuItems,
  textStyle,
  borderColor,
}: {
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  borderColor?: string;
  menuItems: {
    [key: string]: {
      onPress: () => void;
      detail?: React.ReactNode;
      style?: StyleProp<ViewStyle>;
      button?: boolean;
      icon?: React.ReactNode;
      label?: string;
    };
  };
}) {
  // const theme = useTheme();

  return (
    <RoundedContainer>
      {Object.entries(menuItems).map(([key, val]: any, i, { length }) => (
        <SettingsRow
          key={key}
          label={key}
          // id={key}
          // isFirst={i === 0}
          // isLast={i === length - 1}
          onPress={() => val.onPress()}
          // style={{
          //   height: "44px",
          //   padding: "10px",
          //   ...val.style,
          // }}
          // button={val.button === undefined ? true : val.button}
          detailIcon={val.detail ?? <IconPushDetail />}
          // borderColor={borderColor}
        >
          {val.icon && val.icon()}
          <Text style={[{ fontWeight: "500" }, textStyle]}>
            {val.label ?? key}
          </Text>
        </SettingsRow>
      ))}
    </RoundedContainer>
  );
}
