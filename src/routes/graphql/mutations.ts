import { GraphQLBoolean, GraphQLError, GraphQLInputObjectType, GraphQLInt, GraphQLNonNull, GraphQLObjectType, GraphQLString } from "graphql";
import { ChangePostInput, ChangeProfileInput, ChangeUserInput, CreatePostInput, CreateProfileInput, CreateUserInput, MemberIdType, MemberType, PostType, ProfileType, UserType } from "./types/types.js";
import { UUIDType } from "./types/uuid.js";
import { prisma } from "./prismaClient.js";

export const Mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: () => ({
        createPost: {
            type: PostType,
            args: { dto: { type: new GraphQLNonNull(CreatePostInput) } },
            resolve: async (_parent, { dto }) => await prisma.post.create({ data: dto }),
        },
        createUser: {
            type: UserType,
            args: { dto: { type: new GraphQLNonNull(CreateUserInput) } },
            resolve: async (_parent, { dto }) => await prisma.user.create({ data: dto }),
        },
        createProfile: {
            type: ProfileType,
            args: { dto: { type: new GraphQLNonNull(CreateProfileInput) } },
            resolve: async (_parent, { dto }) => await prisma.profile.create({ data: dto }),
        },
        deletePost: {
            type: UUIDType,
            args: { id: { type: new GraphQLNonNull(UUIDType) } },
            resolve: async (_parent, { id }) => {
                const post = await prisma.post.delete({ where: { id } });
                return post.id;
            },
        },
        deleteUser: {
            type: UUIDType,
            args: { id: { type: new GraphQLNonNull(UUIDType) } },
            resolve: async (_parent, { id }) => {
                const user = await prisma.user.delete({ where: { id } });
                return user.id;
            },
        },
        deleteProfile: {
            type: UUIDType,
            args: { id: { type: new GraphQLNonNull(UUIDType) } },
            resolve: async (_parent, { id }) => {
                const profile = await prisma.profile.delete({ where: { id } });
                return profile.id;
            },
        },
        changePost: {
            type: PostType,
            args: { id: { type: new GraphQLNonNull(UUIDType) }, dto: { type: ChangePostInput } },
            resolve: async (_parent, { id, dto }) => await prisma.post.update({ where: { id }, data: dto })
        },
        changeUser: {
            type: UserType,
            args: { id: { type: new GraphQLNonNull(UUIDType) }, dto: { type: ChangeUserInput } },
            resolve: async (_parent, { id, dto }) => await prisma.user.update({ where: { id }, data: dto })
        },
        changeProfile: {
            type: ProfileType,
            args: { id: { type: new GraphQLNonNull(UUIDType) }, dto: { type: ChangeProfileInput } },
            resolve: async (_parent, { id, dto }) => await prisma.profile.update({ where: { id }, data: dto }),

        },
        // subscribeTo: {
        //     type: UUIDType,
        //     args: { userId: { type: new GraphQLNonNull(UUIDType) }, authorId: { type: new GraphQLNonNull(UUIDType) } },
        //     resolve: async (_parent, { userId, authorId }) => await prisma.user.update({ where: { id: userId }, data: { userSubscribedTo: { create: { authorId } } } }),
        // },
        // unsubscribeFrom: {
        //     type: UUIDType,
        //     args: { userId: { type: new GraphQLNonNull(UUIDType) }, authorId: { type: new GraphQLNonNull(UUIDType) } },
        //     resolve: async (_parent, { userId, authorId }) => {
        //         await prisma.subscribersOnAuthors.delete({ where: { subscriberId_authorId: { subscriberId: userId, authorId } } });
        //         return userId;
        //     }
        // },
        subscribeTo: {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            type: UserType,
            args: {
                userId: { type: UUIDType },
                authorId: { type: UUIDType }
            },
            resolve: async (_parent, { userId, authorId }) => {
                await prisma.subscribersOnAuthors.create({ data: { subscriberId: userId, authorId } });
                return prisma.user.findUnique({ where: { id: userId } });
            },
        },
        unsubscribeFrom: {
            type: UUIDType,
            args: {
                userId: { type: UUIDType },
                authorId: { type: UUIDType }
            },
            resolve: async (_parent, { userId, authorId }) => (await prisma.subscribersOnAuthors.delete({
                where: { subscriberId_authorId: { subscriberId: userId, authorId } },
            })).authorId,
        }
    })
});
