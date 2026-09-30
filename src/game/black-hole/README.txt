Void Chase Asset Pack (Phaser-ready)
====================================

Contents
--------
blackhole/
  - blackhole_01.png ... blackhole_06.png
  - blackhole_spritesheet_512x512.png
  - original_blackhole_sheet.png

platforms/
  - platform_long.png
  - platform_small.png
  - platform_cracked.png
  - platform_mossy.png
  - platform_stairs.png
  - platform_fragmented.png
  - original_platform_sheet.png

Phaser usage
------------
Black hole spritesheet:

this.load.spritesheet('blackhole', 'assets/blackhole/blackhole_spritesheet_512x512.png', {
  frameWidth: 512,
  frameHeight: 512
});

this.anims.create({
  key: 'blackhole-spin',
  frames: this.anims.generateFrameNumbers('blackhole', { start: 0, end: 5 }),
  frameRate: 10,
  repeat: -1
});

Platform images:

this.load.image('platform-long', 'assets/platforms/platform_long.png');
this.load.image('platform-small', 'assets/platforms/platform_small.png');
this.load.image('platform-cracked', 'assets/platforms/platform_cracked.png');
this.load.image('platform-mossy', 'assets/platforms/platform_mossy.png');
this.load.image('platform-stairs', 'assets/platforms/platform_stairs.png');
this.load.image('platform-fragmented', 'assets/platforms/platform_fragmented.png');

Notes
-----
- The black hole frames were normalized into 512x512 cells for easy Phaser animation.
- The platform assets were cut into individual transparent PNGs, which is usually better than a spritesheet for level pieces.
