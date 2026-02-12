import { DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';
import * as bcrypt from 'bcrypt';

dotenv.config({ path: '.env' });

async function createAdmin() {
  const configService = new ConfigService();
  
  const dataSource = new DataSource({
    type: 'postgres',
    host: configService.get<string>('DATABASE_HOST') || 'localhost',
    port: configService.get<number>('DATABASE_PORT') || 5432,
    username: configService.get<string>('DATABASE_USER') || 'movie_user',
    password: configService.get<string>('DATABASE_PASSWORD') || 'movie_password',
    database: configService.get<string>('DATABASE_NAME') || 'movie_db',
    entities: [User],
    synchronize: false,
  });

  try {
    await dataSource.initialize();
    console.log('Database connected');

    const userRepository = dataSource.getRepository(User);

    const email = process.argv[2] || 'admin@movie.com';
    const password = process.argv[3] || 'admin123';
    const name = process.argv[4] || 'Admin';

    // Check if admin exists
    const existingUser = await userRepository.findOne({ where: { email } });
    if (existingUser) {
      // Update to admin
      existingUser.isAdmin = true;
      const hashedPassword = await bcrypt.hash(password, 10);
      existingUser.password = hashedPassword;
      await userRepository.save(existingUser);
      console.log(`✅ Updated user ${email} to admin`);
    } else {
      // Create new admin
      const hashedPassword = await bcrypt.hash(password, 10);
      const admin = userRepository.create({
        email,
        password: hashedPassword,
        name,
        isAdmin: true,
      });
      await userRepository.save(admin);
      console.log(`✅ Created admin user: ${email}`);
    }

    await dataSource.destroy();
    console.log('Done!');
  } catch (error) {
    console.error('Error:', error);
    await dataSource.destroy();
    process.exit(1);
  }
}

createAdmin();
