import Phaser from 'phaser';

export default class BackgroundScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BackgroundScene' });
  }

  // Nhận tên chủ đề từ Vue truyền vào
  init(data) {
    this.currentTheme = data.theme || 'daily-life';
  }

  // KHÔNG CẦN HÀM preload() NỮA VÌ KHÔNG LOAD ẢNH!

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    let bgGraphics = this.add.graphics();

    // ==========================================
    // VẼ BACKGROUND DỰA TRÊN CHỦ ĐỀ (BẰNG CODE)
    // ==========================================
    switch (this.currentTheme) {
      case 'daily-life':
        // Chủ đề 1: Sáng Bình Minh (Cam đào -> Vàng nhạt)
        bgGraphics.fillGradientStyle(0xffbfae, 0xffbfae, 0xffe8ba, 0xffe8ba, 1);
        bgGraphics.fillRect(0, 0, width, height);
        
        // Vẽ thêm một ông mặt trời lấp ló
        this.add.circle(width - 150, 150, 80, 0xffffff, 0.4);
        this.createParticles(0xffffff, 20); // Hạt bụi sương mai màu trắng
        break;

      case 'food-cafe':
        // Chủ đề 2: Cà phê Lofi (Nâu ấm -> Cam sữa)
        bgGraphics.fillGradientStyle(0x8B5A2B, 0x8B5A2B, 0xD2B48C, 0xD2B48C, 1);
        bgGraphics.fillRect(0, 0, width, height);

        // Hiệu ứng bong bóng cà phê bay lên
        this.createParticles(0xffe4c4, 15); 
        break;

      case 'travel':
        // Chủ đề 3: Du lịch biển (Xanh dương biển -> Xanh nhạt trời)
        bgGraphics.fillGradientStyle(0x00BFFF, 0x00BFFF, 0x87CEFA, 0x87CEFA, 1);
        bgGraphics.fillRect(0, 0, width, height);
        
        // Vẽ mặt biển cách điệu
        bgGraphics.fillStyle(0x000080, 0.3);
        bgGraphics.fillRect(0, height - 150, width, 150);
        this.createParticles(0xffffff, 30); // Hiệu ứng bọt biển bay bay
        break;

      default:
        // Mặc định: Nền xám đen Cyberpunk
        bgGraphics.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x16213e, 1);
        bgGraphics.fillRect(0, 0, width, height);
    }

    // ==========================================
    // LỚP PHỦ MỜ (OVERLAY) ĐỂ ĐỌC CHỮ RÕ HƠN
    // ==========================================
    let overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.3); // Mờ 30%
    overlay.fillRect(0, 0, width, height);
  }

  // HÀM TẠO HIỆU ỨNG HẠT (PARTICLES) BẰNG PHASER
  createParticles(colorHex, amount) {
    for (let i = 0; i < amount; i++) {
      let x = Phaser.Math.Between(0, this.cameras.main.width);
      let y = Phaser.Math.Between(0, this.cameras.main.height);
      let size = Phaser.Math.Between(2, 6);
      
      let particle = this.add.circle(x, y, size, colorHex, Phaser.Math.FloatBetween(0.2, 0.6));
      
      // Cho hạt bay lơ lửng từ dưới lên trên vô tận
      this.tweens.add({
        targets: particle,
        y: y - Phaser.Math.Between(100, 300),
        alpha: 0,
        duration: Phaser.Math.Between(3000, 6000),
        repeat: -1,
        yoyo: false
      });
    }
  }
}