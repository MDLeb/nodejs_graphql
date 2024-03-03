import { GraphQLBoolean, GraphQLEnumType, GraphQLFloat, GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';
import { UUIDType } from "./uuid.js";
import { prisma } from '../queries.js';
import { MemberTypeId } from '../../member-types/schemas.js';

export const MemberIdType = new GraphQLEnumType({
    name: "MemberTypeId",
    values: {
        [MemberTypeId.BASIC]: { value: MemberTypeId.BASIC },
        [MemberTypeId.BUSINESS]: { value: MemberTypeId.BUSINESS },
    },
});

export const UserType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        id: { type: new GraphQLNonNull(UUIDType) },
        name: { type: new GraphQLNonNull(GraphQLString) },
        balance: { type: GraphQLFloat },
        profile: {
            type: ProfileType,
            resolve: async ({ id }) => await prisma.profile.findUnique({ where: { userId: id } })
        },
        posts: {
            type: new GraphQLList(PostType),
            resolve: async ({ id }) => await prisma.post.findMany({ where: { authorId: id } })
        },
        userSubscribedTo: {
            type: new GraphQLList(UserType),
            resolve: async ({ id }) => {
                const usersId = await prisma.subscribersOnAuthors.findMany({ where: { subscriberId: id } });
                return usersId.map(async ({ authorId: id }) => await prisma.user.findUnique({ where: { id } }));
            }
        },
        subscribedToUser: {
            type: new GraphQLList(UserType),
            resolve: async ({ id }) => {
                const usersId = await prisma.subscribersOnAuthors.findMany({ where: { authorId: id } });
                return usersId.map(async ({ subscriberId: id }) => await prisma.user.findUnique({ where: { id } }));
            }
        }
    })
});

export const ProfileType = new GraphQLObjectType({
    name: 'Profile',
    fields: () => ({
        id: { type: new GraphQLNonNull(UUIDType) },
        isMale: { type: new GraphQLNonNull(GraphQLBoolean) },
        yearOfBirth: { type: new GraphQLNonNull(GraphQLInt) },
        user: { type: UserType },
        userId: { type: new GraphQLNonNull(UUIDType) },
        memberTypeId: { type: new GraphQLNonNull(MemberIdType) },
        memberType: {
            type: MemberType,
            resolve: async ({ memberTypeId }) => await prisma.memberType.findUnique({ where: { id: memberTypeId } })
        },
    })
});

export const PostType = new GraphQLObjectType({
    name: 'Post',
    fields: () => ({
        id: { type: new GraphQLNonNull(UUIDType) },
        title: { type: new GraphQLNonNull(GraphQLString) },
        content: { type: new GraphQLNonNull(GraphQLString) },
        author: { type: UserType }
    })
});

export const MemberType = new GraphQLObjectType({
    name: 'MemberType',
    fields: () => ({
        id: { type: new GraphQLNonNull(MemberIdType) },
        discount: { type: new GraphQLNonNull(GraphQLFloat) },
        postsLimitPerMonth: { type: new GraphQLNonNull(GraphQLInt) },
        profiles: { type: new GraphQLList(ProfileType) }
    })
});
