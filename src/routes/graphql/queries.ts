import { GraphQLList, GraphQLObjectType, GraphQLScalarType } from "graphql";
import { MemberIdType, MemberType, PostType, ProfileType, UserType } from "./types/types.js";
import { UUIDType } from "./types/uuid.js";
import { prisma } from "./prismaClient.js";


export const RootQuery = new GraphQLObjectType({
    name: 'Query',
    fields: {
        users: {
            type: new GraphQLList(UserType),
            resolve: async () => await prisma.user.findMany()
        },
        posts: {
            type: new GraphQLList(PostType),
            resolve: async () => await prisma.post.findMany()
        },
        memberTypes: {
            type: new GraphQLList(MemberType),
            resolve: async () => await prisma.memberType.findMany()
        },
        profiles: {
            type: new GraphQLList(ProfileType),
            resolve: async () => await prisma.profile.findMany()
        },
        user: {
            type: UserType,
            args: { id: { type: UUIDType } },
            resolve: async (_parent, { id }) => await prisma.user.findUnique({ where: { id } })
        },
        post: {
            type: PostType,
            args: { id: { type: UUIDType } },
            resolve: async (_parent, { id }) => await prisma.post.findUnique({ where: { id } })
        },
        memberType: {
            type: MemberType,
            args: { id: { type: MemberIdType } },
            resolve: async (_parent, { id }) => await prisma.memberType.findUnique({ where: { id } })
        },
        profile: {
            type: ProfileType,
            args: { id: { type: UUIDType } },
            resolve: async (_parent, { id }) => await prisma.profile.findUnique({ where: { id } })
        },
    }
})

