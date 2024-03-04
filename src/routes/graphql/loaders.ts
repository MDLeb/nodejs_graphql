import { PrismaClient } from "@prisma/client";
import { Static } from "@sinclair/typebox";
import DataLoader from "dataloader";
import { profileSchema } from "../profiles/schemas.js";
import { postSchema } from "../posts/schemas.js";

export function getLoaders(prisma: PrismaClient) {
    return {

        profileLoader: new DataLoader(async (userIDs: readonly string[]) => {
            const profilesMap = new Map<string, Static<typeof profileSchema>>();
            const profiles = await prisma.profile.findMany({ where: { userId: { in: [...userIDs] } } });
            profiles.forEach((profile) => profilesMap.set(profile.userId, profile));
            return userIDs.map((id) => profilesMap.get(id));
        }),

        postsLoader: new DataLoader(async (userIDs: readonly string[]) => {
            const posts = await prisma.post.findMany({ where: { authorId: { in: [...userIDs] } } });

            const postMap = new Map<string, Static<typeof postSchema>[]>();
            posts.forEach((p) => {
                let author = postMap.get(p.authorId);
                if (author) {
                    author.push(p);
                } else {
                    postMap.set(p.authorId, [p]);
                }
            });

            return userIDs.map((key) => postMap.get(key) ?? null);
        }),

        memberTypeLoader: new DataLoader(async (memberTypeIDs: readonly string[]) => {
            const members = await prisma.memberType.findMany({ where: { id: { in: [...memberTypeIDs] } } });
            const idMemberMap = memberTypeIDs.map((id) => members.find((memberType) => memberType.id === id));
            return idMemberMap;
        }),

        userSubscribedToLoader: new DataLoader(async (userIDs: readonly string[]) => {
            const usersWithAuthors = await prisma.user.findMany({
                where: { id: { in: Array.from(userIDs) } },
                include: { userSubscribedTo: { select: { author: true } } },
            });
            const subscribedAuthorsMap = new Map<string, { id: string; name: string }[]>();

            usersWithAuthors.forEach((user) => {
                const subscribedAuthors = user.userSubscribedTo.map(
                    (subscription) => subscription.author,
                );
                subscribedAuthorsMap.set(user.id, subscribedAuthors);
            });
            return userIDs.map((id) => subscribedAuthorsMap.get(id));
        }),
        subscribedToUserLoader: new DataLoader(async (userIDs: readonly string[]) => {
            const usersWithSubs = await prisma.user.findMany({
                where: { id: { in: Array.from(userIDs) } },
                include: { subscribedToUser: { select: { subscriber: true } } },
            });
            const subscribersMap = new Map<string, { id: string; name: string }[]>();

            usersWithSubs.forEach((user) => {
                let userInMap = subscribersMap.get(user.id);
                if (!userInMap) {
                    subscribersMap.set(user.id, []);
                }

                subscribersMap.get(user.id)?.push(...user.subscribedToUser.map((sub) => sub.subscriber));
            });

            return userIDs.map((id) => subscribersMap.get(id));
        }),
    }
    
}