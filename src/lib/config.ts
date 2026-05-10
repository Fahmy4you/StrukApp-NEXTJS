export const CONFIG_UPLOAD_IMAGES = {
  logo: {
    folder: "logo",
    maxSize: 2 * 1024 * 1024, // 2MB
    allowedTypes: ["image/png", "image/jpeg", "image/webp"],
  },
  profil: {
    folder: "profil",
    maxSize: 2 * 1024 * 1024, // 2MB
    allowedTypes: ["image/png", "image/jpeg", "image/webp"],
  },
  struk: {
    folder: "struk",
    maxSize: 5 * 1024 * 1024, // 5MB (mungkin hasil scan lebih besar)
    allowedTypes: ["image/png", "image/jpeg", "image/webp", "application/pdf"],
  }
};