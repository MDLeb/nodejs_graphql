import { GraphQLNonNull, GraphQLObjectType } from "graphql";
import {
    ChangePostInput, ChangeProfileInput, ChangeUserInput, CreatePostInput,
    CreateProfileInput, CreateUserInput, PostType, ProfileType, UserType
} from "./types/types.js";
import { UUIDType } from "./types/uuid.js";

export const Mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: () => ({
        createPost: {
            type: PostType,
            args: { dto: { type: new GraphQLNonNull(CreatePostInput) } },
            resolve: async (_parent, { dto }, { prisma }) => await prisma.post.create({ data: dto }),
        },
        createUser: {
            type: UserType,
            args: { dto: { type: new GraphQLNonNull(CreateUserInput) } },
            resolve: async (_parent, { dto }, { prisma }) => await prisma.user.create({ data: dto }),
        },
        createProfile: {
            type: ProfileType,
            args: { dto: { type: new GraphQLNonNull(CreateProfileInput) } },
            resolve: async (_parent, { dto }, { prisma }) => await prisma.profile.create({ data: dto }),
        },
        deletePost: {
            type: UUIDType,
            args: { id: { type: new GraphQLNonNull(UUIDType) } },
            resolve: async (_parent, { id }, { prisma }) => {
                const post = await prisma.post.delete({ where: { id } });
                return post.id;
            },
        },
        deleteUser: {
            type: UUIDType,
            args: { id: { type: new GraphQLNonNull(UUIDType) } },
            resolve: async (_parent, { id }, { prisma }) => {
                const user = await prisma.user.delete({ where: { id } });
                return user.id;
            },
        },
        deleteProfile: {
            type: UUIDType,
            args: { id: { type: new GraphQLNonNull(UUIDType) } },
            resolve: async (_parent, { id }, { prisma }) => {
                const profile = await prisma.profile.delete({ where: { id } });
                return profile.id;
            },
        },
        changePost: {
            type: PostType,
            args: { id: { type: new GraphQLNonNull(UUIDType) }, dto: { type: ChangePostInput } },
            resolve: async (_parent, { id, dto }, { prisma }) => await prisma.post.update({ where: { id }, data: dto })
        },
        changeUser: {
            type: UserType,
            args: { id: { type: new GraphQLNonNull(UUIDType) }, dto: { type: ChangeUserInput } },
            resolve: async (_parent, { id, dto }, { prisma }) => await prisma.user.update({ where: { id }, data: dto })
        },
        changeProfile: {
            type: ProfileType,
            args: { id: { type: new GraphQLNonNull(UUIDType) }, dto: { type: ChangeProfileInput } },
            resolve: async (_parent, { id, dto }, { prisma }) => await prisma.profile.update({ where: { id }, data: dto }),
        },
        subscribeTo: {
            type: UserType,
            args: {
                userId: { type: UUIDType },
                authorId: { type: UUIDType }
            },
            resolve: async (_parent, { userId, authorId }, { prisma }) => {
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
            resolve: async (_parent, { userId, authorId }, { prisma }) => (await prisma.subscribersOnAuthors.delete({
                where: { subscriberId_authorId: { subscriberId: userId, authorId } },
            })).authorId,
        }
    })
});
