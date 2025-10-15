#!/usr/bin/env python3
"""
Pokemon Ball Background Generator
Creates a 2560x1440 background image with randomly positioned Pokemon balls
Perfect for stream backgrounds!
"""

import os
import random
import math
from PIL import Image, ImageDraw
import glob

def load_ball_images(balls_folder="Balls"):
    """Load all ball images from the specified folder"""
    ball_files = glob.glob(os.path.join(balls_folder, "*.png"))
    ball_images = []
    
    for ball_file in ball_files:
        try:
            img = Image.open(ball_file)
            ball_images.append((img, os.path.basename(ball_file)))
            print(f"Loaded: {os.path.basename(ball_file)}")
        except Exception as e:
            print(f"Error loading {ball_file}: {e}")
    
    return ball_images

def calculate_distance(pos1, pos2):
    """Calculate distance between two positions"""
    return math.sqrt((pos1[0] - pos2[0])**2 + (pos1[1] - pos2[1])**2)

def is_valid_position(new_pos, new_size, existing_balls, min_distance=80):
    """Check if a new ball position is valid (not too close to existing balls)"""
    for existing_pos, existing_size in existing_balls:
        distance = calculate_distance(new_pos, existing_pos)
        min_required_distance = (new_size + existing_size) / 2 + min_distance
        if distance < min_required_distance:
            return False
    return True

def generate_background(width=2560, height=1440, balls_folder="Balls", output_file="pokemon_balls_background.png"):
    """Generate the background image with randomly positioned balls"""
    
    # Load all ball images
    ball_images = load_ball_images(balls_folder)
    
    if not ball_images:
        print("No ball images found!")
        return
    
    # Create the base canvas with a dark background
    background = Image.new('RGBA', (width, height), (20, 25, 40, 255))  # Dark blue background
    
    # Add some subtle gradient effect
    draw = ImageDraw.Draw(background)
    for y in range(height):
        alpha = int(255 * (1 - y / height * 0.3))  # Subtle gradient
        color = (20, 25, 40, alpha)
        draw.line([(0, y), (width, y)], fill=color)
    
    # Track placed balls to avoid excessive overlap
    placed_balls = []
    max_attempts = 1000
    target_balls = min(50, len(ball_images) * 3)  # Aim for 50 balls or 3x the number of unique balls
    
    print(f"Placing {target_balls} balls on the background...")
    
    for i in range(target_balls):
        # Select a random ball
        ball_img, ball_name = random.choice(ball_images)
        
        # Random size between 60 and 120 pixels
        base_size = random.randint(60, 120)
        
        # Random rotation
        rotation_angle = random.randint(0, 360)
        
        # Resize the ball
        ball_resized = ball_img.resize((base_size, base_size), Image.Resampling.LANCZOS)
        
        # Rotate the ball
        ball_rotated = ball_resized.rotate(rotation_angle, expand=True)
        
        # Try to find a valid position
        attempts = 0
        while attempts < max_attempts:
            # Random position
            x = random.randint(0, width - ball_rotated.width)
            y = random.randint(0, height - ball_rotated.height)
            
            # Check if position is valid
            if is_valid_position((x, y), base_size, placed_balls):
                # Add some transparency variation
                alpha = random.randint(180, 255)
                ball_with_alpha = ball_rotated.copy()
                ball_with_alpha.putalpha(alpha)
                
                # Paste the ball onto the background
                background.paste(ball_with_alpha, (x, y), ball_with_alpha)
                placed_balls.append(((x, y), base_size))
                break
            
            attempts += 1
        
        if attempts >= max_attempts:
            print(f"Could not place ball {i+1} after {max_attempts} attempts")
    
    # Add some sparkle effects
    draw = ImageDraw.Draw(background)
    for _ in range(20):
        x = random.randint(0, width)
        y = random.randint(0, height)
        size = random.randint(2, 6)
        alpha = random.randint(100, 200)
        color = (255, 255, 255, alpha)
        draw.ellipse([x-size, y-size, x+size, y+size], fill=color)
    
    # Save the result
    background.save(output_file, 'PNG')
    print(f"Background saved as: {output_file}")
    print(f"Successfully placed {len(placed_balls)} balls")

def main():
    """Main function"""
    print("🎮 Pokemon Ball Background Generator")
    print("=" * 40)
    
    # Check if Balls folder exists
    if not os.path.exists("Balls"):
        print("Error: 'Balls' folder not found!")
        print("Make sure the script is in the same directory as your Balls folder.")
        return
    
    # Generate the background
    generate_background()
    
    print("\n✨ Background generation complete!")
    print("You can now use 'pokemon_balls_background.png' as your stream background!")

if __name__ == "__main__":
    main()
