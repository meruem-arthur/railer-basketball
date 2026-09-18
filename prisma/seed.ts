import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Deterministic placeholder photos so the demo site looks populated.
// Replace these via the admin Cloudinary uploader once real assets exist.
const playerPhoto = (seed: string) => `https://picsum.photos/seed/railers-${seed}/600/800`;
const widePhoto = (seed: string) => `https://picsum.photos/seed/railers-${seed}/1200/700`;
const squarePhoto = (seed: string) => `https://picsum.photos/seed/railers-${seed}/800/800`;

function slugify(...parts: string[]): string {
  return parts
    .join("-")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function main() {
  console.log("Seeding SRID Railers demo data…");

  // ---------------------------------------------------------------
  // Users
  // ---------------------------------------------------------------
  const passwordHash = await bcrypt.hash("Bond442@love1", 12);

  const superAdmin = await prisma.user.upsert({
    where: { email: "meruemarthur@gmail.com" },
    update: {},
    create: {
      name: "Meruem Arthur",
      email: "meruemarthur@gmail.com",
      passwordHash,
      role: "SUPER_ADMIN",
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: "admin@sridrailers.demo" },
    update: {},
    create: {
      name: "Ama Boateng",
      email: "admin@sridrailers.demo",
      passwordHash,
      role: "ADMIN",
    },
  });

  const editor = await prisma.user.upsert({
    where: { email: "editor@sridrailers.demo" },
    update: {},
    create: {
      name: "Yaw Mensah",
      email: "editor@sridrailers.demo",
      passwordHash,
      role: "EDITOR",
    },
  });

  // ---------------------------------------------------------------
  // Site settings + social links
  // ---------------------------------------------------------------
  await prisma.siteSetting.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      teamName: "UMaT SRID Railers",
      slogan: "Speed. Precision. Victory.",
      aboutText:
        "UMaT SRID Railers is the official basketball team of the School of Railway and Infrastructure Development at the University of Mines and Technology, Ghana. Built on the same discipline and precision that define railway engineering, the Railers compete with speed, structure, and relentless momentum.",
      contactEmail: "railers@umat.edu.gh",
      contactPhone: "+233 20 000 0000",
      venue: "UMaT Sports Complex, Essikado",
    },
  });

  for (const social of [
    { platform: "instagram", url: "https://instagram.com/sridrailers" },
    { platform: "facebook", url: "https://facebook.com/sridrailers" },
    { platform: "x", url: "https://x.com/sridrailers" },
  ]) {
    await prisma.socialLink.upsert({
      where: { platform: social.platform },
      update: {},
      create: { ...social, active: true },
    });
  }

  // ---------------------------------------------------------------
  // Seasons
  // ---------------------------------------------------------------
  const pastSeason = await prisma.teamSeason.upsert({
    where: { label: "2025/26" },
    update: {},
    create: {
      label: "2025/26",
      startDate: new Date("2025-09-01"),
      endDate: new Date("2026-06-30"),
      isCurrent: false,
      isArchived: true,
    },
  });

  const currentSeason = await prisma.teamSeason.upsert({
    where: { label: "2026/27" },
    update: {},
    create: {
      label: "2026/27",
      startDate: new Date("2026-09-01"),
      endDate: new Date("2027-06-30"),
      isCurrent: true,
      isArchived: false,
    },
  });

  // ---------------------------------------------------------------
  // Players
  // ---------------------------------------------------------------
  const playerSeed = [
    { firstName: "Kofi", lastName: "Asante", position: "POINT_GUARD" as const, jersey: 3, heightCm: 183, programme: "Mining Engineering" },
    { firstName: "Nana", lastName: "Yeboah", position: "SHOOTING_GUARD" as const, jersey: 7, heightCm: 188, programme: "Rail Infrastructure Engineering" },
    { firstName: "Emmanuel", lastName: "Darko", position: "SMALL_FORWARD" as const, jersey: 11, heightCm: 195, programme: "Geomatic Engineering" },
    { firstName: "Isaac", lastName: "Amponsah", position: "POWER_FORWARD" as const, jersey: 15, heightCm: 201, programme: "Mechanical Engineering" },
    { firstName: "Samuel", lastName: "Owusu", position: "CENTER" as const, jersey: 21, heightCm: 206, programme: "Rail Infrastructure Engineering" },
    { firstName: "Daniel", lastName: "Kufuor", position: "POINT_GUARD" as const, jersey: 5, heightCm: 180, programme: "Petroleum Engineering" },
    { firstName: "Michael", lastName: "Osei", position: "SHOOTING_GUARD" as const, jersey: 9, heightCm: 190, programme: "Mining Engineering" },
    { firstName: "Prince", lastName: "Adjei", position: "SMALL_FORWARD" as const, jersey: 13, heightCm: 193, programme: "Geological Engineering" },
    { firstName: "Bright", lastName: "Sarpong", position: "POWER_FORWARD" as const, jersey: 23, heightCm: 199, programme: "Environmental Engineering" },
    { firstName: "Eric", lastName: "Appiah", position: "CENTER" as const, jersey: 25, heightCm: 203, programme: "Rail Infrastructure Engineering" },
  ];

  const playerSeasons: { id: string; jerseyNumber: number; firstName: string; lastName: string }[] = [];

  for (const p of playerSeed) {
    const slug = slugify(p.firstName, p.lastName);
    const player = await prisma.player.upsert({
      where: { slug },
      update: {},
      create: {
        firstName: p.firstName,
        lastName: p.lastName,
        slug,
        heightCm: p.heightCm,
        programme: p.programme,
        academicLevel: "LEVEL_300",
        hometown: "Tarkwa, Ghana",
        yearJoined: 2024,
        bio: `${p.firstName} is a key contributor for the Railers, bringing discipline and consistency to every game.`,
        photoUrl: playerPhoto(slug),
        active: true,
      },
    });

    const ps = await prisma.playerSeason.upsert({
      where: { seasonId_jerseyNumber: { seasonId: currentSeason.id, jerseyNumber: p.jersey } },
      update: {},
      create: {
        playerId: player.id,
        seasonId: currentSeason.id,
        jerseyNumber: p.jersey,
        position: p.position,
        active: true,
      },
    });

    playerSeasons.push({ id: ps.id, jerseyNumber: ps.jerseyNumber, firstName: p.firstName, lastName: p.lastName });
  }

  // ---------------------------------------------------------------
  // Games — 3 completed, 3 upcoming, all in the current season
  // ---------------------------------------------------------------
  const now = Date.now();
  const day = 1000 * 60 * 60 * 24;

  const completedFixtures = [
    { opponentName: "KNUST Bulldogs", railersScore: 78, opponentScore: 65, daysAgo: 21 },
    { opponentName: "Legon Lions", railersScore: 71, opponentScore: 74, daysAgo: 14 },
    { opponentName: "KsTU Titans", railersScore: 84, opponentScore: 69, daysAgo: 7 },
  ];

  const completedGameIds: string[] = [];

  for (const fixture of completedFixtures) {
    const game = await prisma.game.create({
      data: {
        seasonId: currentSeason.id,
        opponentName: fixture.opponentName,
        dateTime: new Date(now - fixture.daysAgo * day),
        venue: "UMaT Sports Complex, Tarkwa",
        competition: "GUSA League",
        homeAway: "HOME",
        status: "COMPLETED",
        railersScore: fixture.railersScore,
        opponentScore: fixture.opponentScore,
        gameReport: `The Railers ${fixture.railersScore > fixture.opponentScore ? "secured a strong win" : "fought hard in a narrow defeat"} against ${fixture.opponentName}, with contributions across the roster in both halves.`,
      },
    });
    completedGameIds.push(game.id);

    const q1r = Math.round(fixture.railersScore * 0.24);
    const q2r = Math.round(fixture.railersScore * 0.26);
    const q3r = Math.round(fixture.railersScore * 0.25);
    const q4r = fixture.railersScore - q1r - q2r - q3r;
    const q1o = Math.round(fixture.opponentScore * 0.24);
    const q2o = Math.round(fixture.opponentScore * 0.26);
    const q3o = Math.round(fixture.opponentScore * 0.25);
    const q4o = fixture.opponentScore - q1o - q2o - q3o;

    await prisma.gameQuarterScore.createMany({
      data: [
        { gameId: game.id, quarter: 1, railersScore: q1r, opponentScore: q1o },
        { gameId: game.id, quarter: 2, railersScore: q2r, opponentScore: q2o },
        { gameId: game.id, quarter: 3, railersScore: q3r, opponentScore: q3o },
        { gameId: game.id, quarter: 4, railersScore: q4r, opponentScore: q4o },
      ],
    });

    // Distribute points across five starters, roughly summing to the final score.
    const starters = playerSeasons.slice(0, 5);
    const weights = [0.28, 0.22, 0.2, 0.16, 0.14];
    let assigned = 0;
    const statsData = starters.map((ps, i) => {
      const isLast = i === starters.length - 1;
      const points = isLast
        ? fixture.railersScore - assigned
        : Math.round(fixture.railersScore * weights[i]);
      assigned += points;
      return {
        gameId: game.id,
        playerSeasonId: ps.id,
        minutes: 28 + i,
        points,
        rebounds: Math.max(1, 8 - i),
        assists: Math.max(1, 5 - i),
        steals: Math.max(0, 3 - i),
        blocks: Math.max(0, 2 - i),
        turnovers: 1 + (i % 3),
        fouls: 1 + (i % 4),
        fieldGoalsMade: Math.round(points / 2.2),
        fieldGoalsAttempted: Math.round(points / 1.4),
        threePointersMade: i < 2 ? 2 : 0,
        threePointersAttempted: i < 2 ? 5 : 1,
        freeThrowsMade: Math.round(points * 0.1),
        freeThrowsAttempted: Math.round(points * 0.12) + 1,
      };
    });

    await prisma.playerGameStat.createMany({ data: statsData });

    const topScorer = [...statsData].sort((a, b) => b.points - a.points)[0];
    await prisma.game.update({ where: { id: game.id }, data: { mvpPlayerSeasonId: topScorer.playerSeasonId } });

    const teamRebounds = statsData.reduce((s, d) => s + d.rebounds, 0);
    const teamAssists = statsData.reduce((s, d) => s + d.assists, 0);
    const teamTurnovers = statsData.reduce((s, d) => s + d.turnovers, 0);
    const teamFgMade = statsData.reduce((s, d) => s + d.fieldGoalsMade, 0);
    const teamFgAttempted = statsData.reduce((s, d) => s + d.fieldGoalsAttempted, 0);

    await prisma.teamGameStat.create({
      data: {
        gameId: game.id,
        seasonId: currentSeason.id,
        rebounds: teamRebounds,
        assists: teamAssists,
        turnovers: teamTurnovers,
        fieldGoals: teamFgMade,
        fieldGoalAttempts: teamFgAttempted,
      },
    });
  }

  const upcomingFixtures = [
    { opponentName: "UDS Warriors", daysAhead: 5 },
    { opponentName: "UCC Panthers", daysAhead: 12 },
    { opponentName: "UPSA Eagles", daysAhead: 20 },
  ];

  for (const fixture of upcomingFixtures) {
    await prisma.game.create({
      data: {
        seasonId: currentSeason.id,
        opponentName: fixture.opponentName,
        dateTime: new Date(now + fixture.daysAhead * day),
        venue: "UMaT Sports Complex, Tarkwa",
        competition: "GUSA League",
        homeAway: fixture.daysAhead % 2 === 0 ? "AWAY" : "HOME",
        status: "UPCOMING",
      },
    });
  }

  // ---------------------------------------------------------------
  // News
  // ---------------------------------------------------------------
  const categoryDefs: { name: "TEAM_NEWS" | "MATCH_REPORT" | "TRAINING" | "TOURNAMENT" | "PLAYER_NEWS" | "ANNOUNCEMENT"; label: string }[] = [
    { name: "TEAM_NEWS", label: "Team News" },
    { name: "MATCH_REPORT", label: "Match Report" },
    { name: "TRAINING", label: "Training" },
    { name: "TOURNAMENT", label: "Tournament" },
    { name: "PLAYER_NEWS", label: "Player News" },
    { name: "ANNOUNCEMENT", label: "Announcement" },
  ];

  const categories: Record<string, string> = {};
  for (const c of categoryDefs) {
    const cat = await prisma.newsCategory.upsert({
      where: { name: c.name },
      update: {},
      create: c,
    });
    categories[c.name] = cat.id;
  }

  const newsSeed = [
    {
      title: "Railers Open GUSA Season With Statement Win",
      category: "MATCH_REPORT",
      excerpt: "UMaT SRID Railers opened their GUSA League campaign with a commanding 78-65 win over KNUST Bulldogs.",
      content: "<p>UMaT SRID Railers opened their GUSA League campaign in style, defeating KNUST Bulldogs 78-65 at the UMaT Sports Complex. The team showed strong ball movement and disciplined defense throughout.</p><p>Head coach praised the squad's preparation heading into the season, noting the depth across the roster.</p>",
    },
    {
      title: "Pre-Season Training Camp Wraps Up",
      category: "TRAINING",
      excerpt: "The Railers concluded a two-week pre-season training camp focused on conditioning and system installation.",
      content: "<p>The squad spent two weeks building fitness and installing new offensive and defensive systems ahead of the 2026/27 season.</p><p>Coaching staff report the roster is in the best shape it has been in recent years.</p>",
    },
    {
      title: "New Recruits Join the Railers Roster",
      category: "PLAYER_NEWS",
      excerpt: "Several new students have joined the basketball program ahead of the new academic year.",
      content: "<p>The Railers welcome a new group of students into the program this season, adding depth at every position.</p>",
    },
    {
      title: "GUSA Tournament Dates Announced",
      category: "TOURNAMENT",
      excerpt: "The Ghana University Sports Association has released the full fixture list for this season's basketball tournament.",
      content: "<p>The GUSA League fixture list is out, with the Railers set to play a full home-and-away schedule against university sides across the country.</p>",
    },
    {
      title: "Railers Basketball Program Expands Coaching Staff",
      category: "TEAM_NEWS",
      excerpt: "The programme has added additional coaching support ahead of a demanding season schedule.",
      content: "<p>UMaT SRID Railers have strengthened their coaching staff ahead of the season, adding capacity for player development and scouting.</p>",
    },
  ];

  for (const [i, n] of newsSeed.entries()) {
    const slug = slugify(n.title);
    await prisma.newsArticle.upsert({
      where: { slug },
      update: {},
      create: {
        title: n.title,
        slug,
        excerpt: n.excerpt,
        content: n.content,
        featuredImageUrl: widePhoto(`news-${i}`),
        categoryId: categories[n.category],
        authorId: i % 2 === 0 ? admin.id : editor.id,
        status: "PUBLISHED",
        publishedAt: new Date(now - (newsSeed.length - i) * 3 * day),
      },
    });
  }

  // ---------------------------------------------------------------
  // Gallery
  // ---------------------------------------------------------------
  const albumSeed: { title: string; category: "GAME_DAY" | "TRAINING" | "TEAM"; count: number }[] = [
    { title: "Season Opener vs KNUST", category: "GAME_DAY", count: 4 },
    { title: "Pre-Season Training Camp", category: "TRAINING", count: 3 },
    { title: "2026/27 Team Photos", category: "TEAM", count: 3 },
  ];

  for (const [ai, album] of albumSeed.entries()) {
    const slug = slugify(album.title);
    const created = await prisma.galleryAlbum.upsert({
      where: { slug },
      update: {},
      create: {
        title: album.title,
        slug,
        category: album.category,
        description: `Photos from ${album.title.toLowerCase()}.`,
        createdById: admin.id,
        coverImageUrl: squarePhoto(`album-${ai}-0`),
        gameId: album.category === "GAME_DAY" ? completedGameIds[0] : undefined,
      },
    });

    const existingImages = await prisma.galleryImage.count({ where: { albumId: created.id } });
    if (existingImages === 0) {
      await prisma.galleryImage.createMany({
        data: Array.from({ length: album.count }, (_, i) => ({
          albumId: created.id,
          cloudinaryPublicId: `srid-railers/gallery/seed-${ai}-${i}`,
          secureUrl: squarePhoto(`album-${ai}-${i}`),
          altText: `${album.title} photo ${i + 1}`,
          sortOrder: i,
        })),
      });
    }
  }

  // ---------------------------------------------------------------
  // Announcements
  // ---------------------------------------------------------------
  const announcementSeed = [
    { title: "Season Tickets Now Available", content: "Season tickets for the 2026/27 GUSA League campaign are now on sale at the UMaT Sports Complex office.", priority: "NORMAL" as const },
    { title: "Home Opener Moved to 6:00 PM", content: "Due to a scheduling conflict, the home opener against UDS Warriors has been moved to a 6:00 PM tip-off.", priority: "IMPORTANT" as const },
    { title: "Tryouts Open for Spring Intake", content: "Tryouts for students joining in the spring intake are now open. Apply via the Tryouts page.", priority: "NORMAL" as const },
    { title: "Team Bus Departure Time Changed", content: "The team bus for the away fixture at UCC now departs at 7:00 AM instead of 8:00 AM.", priority: "URGENT" as const },
    { title: "Congratulations to Our GUSA Award Nominees", content: "Two Railers players have been nominated for GUSA League individual season awards.", priority: "NORMAL" as const },
  ];

  for (const [i, a] of announcementSeed.entries()) {
    const existing = await prisma.announcement.findFirst({ where: { title: a.title } });
    if (!existing) {
      await prisma.announcement.create({
        data: {
          title: a.title,
          content: a.content,
          priority: a.priority,
          status: "ACTIVE",
          publishedAt: new Date(now - i * day),
          expiresAt: new Date(now + (30 - i) * day),
        },
      });
    }
  }

  // ---------------------------------------------------------------
  // Tryout applications
  // ---------------------------------------------------------------
  const tryoutSeed = [
    { fullName: "Joseph Amoah", position: "POINT_GUARD" as const, level: "LEVEL_100" as const, status: "PENDING" as const },
    { fullName: "Richard Boadi", position: "SHOOTING_GUARD" as const, level: "LEVEL_200" as const, status: "SHORTLISTED" as const },
    { fullName: "Solomon Tetteh", position: "SMALL_FORWARD" as const, level: "LEVEL_100" as const, status: "PENDING" as const },
    { fullName: "Francis Nkrumah", position: "POWER_FORWARD" as const, level: "LEVEL_300" as const, status: "APPROVED" as const },
    { fullName: "Andrews Quaye", position: "CENTER" as const, level: "LEVEL_200" as const, status: "REJECTED" as const },
  ];

  for (const [i, t] of tryoutSeed.entries()) {
    const email = `${slugify(t.fullName)}@st.umat.edu.gh`;
    const existing = await prisma.tryoutApplication.findFirst({ where: { email } });
    if (!existing) {
      await prisma.tryoutApplication.create({
        data: {
          fullName: t.fullName,
          studentId: `UMAT${20260000 + i}`,
          programme: "Mining Engineering",
          level: t.level,
          phone: `+23320000${1000 + i}`,
          email,
          dateOfBirth: new Date(2004, i, 15),
          position: t.position,
          heightCm: 180 + i * 3,
          previousExperience: "Played for secondary school and regional junior teams.",
          yearsPlayed: 3 + i,
          motivation: "I want to represent UMaT SRID Railers and grow as a competitive basketball player while pursuing my degree.",
          emergencyContactName: "Parent/Guardian",
          emergencyContactPhone: `+23324000${2000 + i}`,
          status: t.status,
        },
      });
    }
  }

  console.log("Seed complete.");
  console.log("Demo admin credentials (change immediately in production):");
  console.log(`  Super Admin: ${superAdmin.email} / RailersDemo2026!`);
  console.log(`  Admin:       ${admin.email} / RailersDemo2026!`);
  console.log(`  Editor:      ${editor.email} / RailersDemo2026!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
