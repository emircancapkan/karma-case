import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import Slider from "@react-native-community/slider";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/src/theme";

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (range: number) => void;
  currentRange?: number;
}

const { width } = Dimensions.get("window");

export const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  onApply,
  currentRange = 10,
}) => {
  const [range, setRange] = useState(currentRange);

  const handleApply = () => {
    onApply(range);
    onClose();
  };

  const handleClose = () => {
    setRange(currentRange); // Reset to current value
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Filter</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={24} color={colors.gray600} />
            </TouchableOpacity>
          </View>

          {/* Instruction */}
          <View style={styles.instructionContainer}>
            <Text style={styles.instructionTitle}>Filter</Text>
            <Text style={styles.instruction}>
              Filter to see results close to you
            </Text>
          </View>

          {/* Distance Slider */}
          <View style={styles.sliderContainer}>
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabel}>0km</Text>
              <Text style={styles.sliderLabel}>100km</Text>
            </View>

            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              value={range}
              onValueChange={setRange}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.gray300}
              thumbTintColor={colors.primary}
            />

            <View style={styles.valueContainer}>
              <Text style={styles.valueText}>{Math.round(range)}km</Text>
            </View>
          </View>

          {/* Apply Button */}
          <TouchableOpacity
            style={styles.applyButton}
            onPress={handleApply}
            activeOpacity={0.8}
          >
            <Text style={styles.applyButtonText}>See Results</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modal: {
    backgroundColor: colors.white,
    borderRadius: 16,
    width: width * 0.9,
    maxWidth: 400,
    padding: 24,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.black,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.gray50,
    justifyContent: "center",
    alignItems: "center",
  },
  instructionContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 24,
    textAlign: "center",
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    textAlign: "center",
  },
  instruction: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.black,
    textAlign: "center",
  },
  sliderContainer: {
    marginBottom: 32,
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  sliderLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.gray600,
  },
  slider: {
    width: "100%",
    height: 40,
    marginVertical: 20,
  },
  valueContainer: {
    alignItems: "center",
    marginTop: 16,
  },
  valueText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.primary,
  },
  applyButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.white,
  },
});
