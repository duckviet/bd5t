import type { ProgressPresenceMatrix } from "./types"

export function createEmptyProgressPresenceMatrix(): ProgressPresenceMatrix {
  return {
    DAO_DUC: {
      TRUONG: false,
      DHQGHN: false,
      THANH_PHO: false,
      TRUNG_UONG: false,
    },
    HOC_TAP: {
      TRUONG: false,
      DHQGHN: false,
      THANH_PHO: false,
      TRUNG_UONG: false,
    },
    THE_LUC: {
      TRUONG: false,
      DHQGHN: false,
      THANH_PHO: false,
      TRUNG_UONG: false,
    },
    TINH_NGUYEN: {
      TRUONG: false,
      DHQGHN: false,
      THANH_PHO: false,
      TRUNG_UONG: false,
    },
    HOI_NHAP: {
      TRUONG: false,
      DHQGHN: false,
      THANH_PHO: false,
      TRUNG_UONG: false,
    },
  }
}
