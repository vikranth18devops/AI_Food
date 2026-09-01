import { PrismaClient, AnalysisStatus, SourceType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding development database...');

  // Password for demo user: TestPass123!
  const passwordHash = await bcrypt.hash('TestPass123!', 10);

  const user = await prisma.user.upsert({
    where: { email: 'demo@foodlens.ai' },
    update: { passwordHash },
    create: {
      email: 'demo@foodlens.ai',
      name: 'Demo Gourmet',
      passwordHash,
      profile: {
        create: {
          dietaryPreferences: ['High Protein', 'Balanced'],
          allergies: ['Peanuts'],
          defaultServingGrams: 350,
        },
      },
    },
  });

  console.log(`Created demo user: ${user.email} (${user.id})`);

  // Create sample food image record
  const image = await prisma.foodImage.create({
    data: {
      userId: user.id,
      filename: 'sample_chicken_biryani.jpg',
      originalName: 'chicken_biryani.jpg',
      mimeType: 'image/jpeg',
      sizeBytes: 1024500,
      storagePath: 'uploads/sample_chicken_biryani.jpg',
      url: '/api/v1/images/sample_chicken_biryani.jpg',
    },
  });

  // Create sample completed analysis for Chicken Biryani
  const analysis = await prisma.foodAnalysis.create({
    data: {
      userId: user.id,
      imageId: image.id,
      status: AnalysisStatus.COMPLETED,
      servingGrams: 350,
      identifiedFood: {
        create: {
          foodName: 'Chicken Biryani',
          confidence: 0.94,
          possibleFoods: [
            { name: 'Chicken Biryani', confidence: 0.94 },
            { name: 'Mutton Pulao', confidence: 0.04 },
            { name: 'Fried Rice', confidence: 0.02 },
          ],
          ingredients: {
            create: [
              { name: 'Basmati Rice' },
              { name: 'Chicken Breast' },
              { name: 'Onion' },
              { name: 'Yogurt' },
              { name: 'Ghee & Spices' },
            ],
          },
          nutritionFacts: {
            create: {
              baseServingSize: '100g',
              calories: 194.3,
              protein: 8.86,
              carbohydrates: 23.43,
              fat: 7.14,
              saturatedFat: 2.1,
              fiber: 1.14,
              sugar: 1.43,
              sodium: 262.8,
              source: 'USDA FoodData Central / FoodLens Engine',
              sourceUrl: 'https://fdc.nal.usda.gov/',
            },
          },
        },
      },
      healthAnalysis: {
        create: {
          benefits: [
            'High quality complete protein source from lean chicken breast',
            'Rich in essential spices like turmeric, cardamom, and cinnamon offering antioxidants',
            'Sustained energy from complex carbohydrates in long-grain basmati rice',
          ],
          concerns: [
            'Can be calorie dense depending on cooking ghee and oil quantity',
            'Sodium content can vary significantly based on restaurant preparation',
          ],
          pros: ['High Protein', 'Rich Flavor Profile', 'Satiating Meal'],
          cons: ['Calorie Dense', 'Moderate Fat Content'],
          allergens: ['Dairy (Yogurt/Ghee)'],
          dietaryCompatibility: [
            { diet: 'Vegetarian', isCompatible: false, reason: 'Contains chicken' },
            { diet: 'Vegan', isCompatible: false, reason: 'Contains chicken and dairy ghee' },
            { diet: 'High Protein', isCompatible: true, reason: 'Provides ~31g protein per 350g serving' },
            { diet: 'Low Carb', isCompatible: false, reason: 'Rice based dish rich in carbs' },
          ],
          recommendations: [
            'Pair with a side salad or cucumber raita to increase fiber and digestive enzymes',
            'Control portion size to fit within daily caloric targets',
          ],
          disclaimer:
            'Nutrition and health information is educational and may vary based on ingredients, recipe, preparation method, and portion size. It is not medical advice.',
          claims: {
            create: [
              {
                claim: 'Spices used in biryani contain polyphenols with anti-inflammatory properties.',
                category: 'BENEFIT',
                sources: {
                  create: [
                    {
                      name: 'PubMed Central - Spice Polyphenols',
                      url: 'https://pubmed.ncbi.nlm.nih.gov/',
                      sourceType: SourceType.HEALTH,
                      title: 'Antioxidant Properties of Culinary Spices',
                    },
                  ],
                },
              },
            ],
          },
        },
      },
      youtubeVideos: {
        create: [
          {
            videoId: 'sample_v1',
            title: 'Authentic Chicken Biryani Masterclass & Calorie Breakdown',
            channelTitle: 'Culinary Science & Flavors',
            description: 'Learn how to make healthy chicken biryani step by step with precise macro breakdowns.',
            thumbnailUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=60',
            publishedAt: '2025-06-15',
            url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          },
          {
            videoId: 'sample_v2',
            title: 'High Protein Biryani Recipe - Fitness Edition',
            channelTitle: 'Meal Prep Master',
            description: 'Reduced fat, high protein version of traditional biryani perfect for fitness goals.',
            thumbnailUrl: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=500&auto=format&fit=crop&q=60',
            publishedAt: '2025-08-10',
            url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          },
        ],
      },
    },
  });

  console.log(`Created sample completed analysis (${analysis.id})`);
  console.log('Seeding completed successfully!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
