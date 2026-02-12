import { DataSource } from 'typeorm';
import { Movie } from '../movies/entities/movie.entity';
import { User } from '../users/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

async function seed() {
  const configService = new ConfigService();
  
  const dataSource = new DataSource({
    type: 'postgres',
    host: configService.get<string>('DATABASE_HOST') || 'localhost',
    port: configService.get<number>('DATABASE_PORT') || 5432,
    username: configService.get<string>('DATABASE_USER') || 'movie_user',
    password: configService.get<string>('DATABASE_PASSWORD') || 'movie_password',
    database: configService.get<string>('DATABASE_NAME') || 'movie_db',
    entities: [Movie, User],
    synchronize: true,
    logging: false,
  });

  try {
    await dataSource.initialize();
    console.log('Database connected');
    console.log('Creating tables if not exist...');

    await new Promise(resolve => setTimeout(resolve, 1000));

    const movieRepository = dataSource.getRepository(Movie);

    let existingMovies = 0;
    try {
      existingMovies = await movieRepository.count();
    } catch (error) {
      console.log('Waiting for tables to be created...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      existingMovies = await movieRepository.count();
    }
    
    if (existingMovies > 0) {
      console.log(`Database already has ${existingMovies} movies. Skipping seed.`);
      await dataSource.destroy();
      return;
    }
    
    console.log('Starting to seed movies...');

    const sampleMovies = [
      {
        title: 'The Dark Knight',
        description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
        thumbnail: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
        backdrop: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
        genres: ['Action', 'Crime', 'Drama'],
        duration: 152,
        releaseDate: '2008-07-18',
        rating: 9.0,
        viewCount: 0,
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        trailerUrl: 'https://www.youtube.com/watch?v=EXeTwQWrcwY',
        isFeatured: true,
        isPremium: false,
        cast: ['Christian Bale', 'Heath Ledger', 'Aaron Eckhart'],
        directors: ['Christopher Nolan'],
      },
      {
        title: 'Inception',
        description: 'A skilled thief is given a chance at redemption if he can pull off an impossible heist: planting an idea in someone\'s mind through dream-sharing technology.',
        thumbnail: 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
        backdrop: 'https://image.tmdb.org/t/p/w1280/s3TBrRGB1iav7gFgNTSuIxo6xxm.jpg',
        genres: ['Action', 'Sci-Fi', 'Thriller'],
        duration: 148,
        releaseDate: '2010-07-16',
        rating: 8.8,
        viewCount: 0,
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        trailerUrl: 'https://www.youtube.com/watch?v=YoHD9XEInc0',
        isFeatured: true,
        isPremium: false,
        cast: ['Leonardo DiCaprio', 'Marion Cotillard', 'Tom Hardy'],
        directors: ['Christopher Nolan'],
      },
      {
        title: 'Interstellar',
        description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
        thumbnail: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
        backdrop: 'https://image.tmdb.org/t/p/w1280/pbrkL804c8yAv3zBZR4QP1BJ6X1.jpg',
        genres: ['Adventure', 'Drama', 'Sci-Fi'],
        duration: 169,
        releaseDate: '2014-11-07',
        rating: 8.6,
        viewCount: 0,
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        trailerUrl: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
        isFeatured: true,
        isPremium: false,
        cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain'],
        directors: ['Christopher Nolan'],
      },
      {
        title: 'The Matrix',
        description: 'A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.',
        thumbnail: 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
        backdrop: 'https://image.tmdb.org/t/p/w1280/fNG7e7RTJjf8P9fKd7v0gqI9QyF.jpg',
        genres: ['Action', 'Sci-Fi'],
        duration: 136,
        releaseDate: '1999-03-31',
        rating: 8.7,
        viewCount: 0,
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        trailerUrl: 'https://www.youtube.com/watch?v=vKQi3bBA1y8',
        isFeatured: false,
        isPremium: false,
        cast: ['Keanu Reeves', 'Laurence Fishburne', 'Carrie-Anne Moss'],
        directors: ['Lana Wachowski', 'Lilly Wachowski'],
      },
      {
        title: 'Pulp Fiction',
        description: 'The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.',
        thumbnail: 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
        backdrop: 'https://image.tmdb.org/t/p/w1280/suaEOtk1N1sgg2MTM7oZd2cfVp3.jpg',
        genres: ['Crime', 'Drama'],
        duration: 154,
        releaseDate: '1994-10-14',
        rating: 8.9,
        viewCount: 0,
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        trailerUrl: 'https://www.youtube.com/watch?v=s7EdQ4FqbhY',
        isFeatured: false,
        isPremium: false,
        cast: ['John Travolta', 'Samuel L. Jackson', 'Uma Thurman'],
        directors: ['Quentin Tarantino'],
      },
    ];

    await movieRepository.save(sampleMovies);
    console.log(`Seeded ${sampleMovies.length} movies`);

    await dataSource.destroy();
    console.log('Seeding completed');
  } catch (error) {
    console.error('Error seeding database:', error);
    await dataSource.destroy();
    process.exit(1);
  }
}

seed();
