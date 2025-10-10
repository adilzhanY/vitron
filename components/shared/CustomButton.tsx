import { TouchableOpacity, Text } from "react-native";

import { ButtonProps } from "@/types/type";

const getBgVariantStyle = (variant: ButtonProps["bgVariant"]) => {
  switch (variant) {
    case "secondary":
      return "bg-gray-500";
    case "danger":
      return "bg-red-500";
    case "success":
      return "bg-green-500";
    case "outline":
      return "bg-transparent border-neutral-300 border-[0.5px]";
    default:
      return "bg-green-300";
  }
};

const getTextVariantStyle = (variant: ButtonProps["textVariant"]) => {
  switch (variant) {
    case "primary":
      return "text-black";
    case "secondary":
      return "text-gray-100";
    case "danger":
      return "text-red-100";
    case "success":
      return "text-green-100";
    default:
      return "text-black";
  }
};

// New function to get the custom shadow style
const getShadowStyle = (variant: ButtonProps["shadowVariant"]) => {
    switch (variant) {
        case "s":
            return "shadow-s-custom"; // Uses the custom small shadow
        case "m":
            return "shadow-m-custom"; // Uses the custom medium shadow
        case "none":
        default:
            return "shadow-none"; // No shadow
    }
}

const CustomButton = ({
  onPress,
  title,
  bgVariant = "primary",
  textVariant = "default",
  shadowVariant = "m",
  IconLeft,
  IconRight,
  className,
  ...props
}: ButtonProps & {shadowVariant?: 's' | 'm' | 'none'}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`rounded-full p-3 flex flex-row justify-center items-center shadow-sm shadow-black/30 ${getBgVariantStyle(bgVariant)} ${getShadowStyle(shadowVariant)} ${className}`}
      {...props}
    >
      {IconLeft && <IconLeft />}
      <Text className={`text-lg font-benzinExtraBold ${getTextVariantStyle(textVariant)}`}>
        {title}
      </Text>
      {IconRight && <IconRight />}
    </TouchableOpacity>
  );
};

export default CustomButton;
