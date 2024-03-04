import { GraphQLList, GraphQLObjectType } from "graphql";
import { ResolveTree, simplifyParsedResolveInfoFragmentWithType, parseResolveInfo } from "graphql-parse-resolve-info";
import { User } from "@prisma/client";
import { UUIDType } from "./types/uuid.js";
import { MemberIdType, MemberType, PostType, ProfileType, UserType } from "./types/types.js";


export const RootQuery = new GraphQLObjectType({
    name: 'Query',
    fields: {
        users: {
            type: new GraphQLList(UserType),
            resolve: async (_parent, _args, { prisma, dataLoader }, _info) => {

                const { fields } = simplifyParsedResolveInfoFragmentWithType(
                    parseResolveInfo(_info) as ResolveTree,
                    new GraphQLList(UserType),
                );

                const shouldIncludeUserSubscribedTo = 'userSubscribedTo' in fields;
                const shouldIncludeSubscribedToUser = 'subscribedToUser' in fields;

                const users = await prisma.user.findMany({
                    include: {
                        userSubscribedTo: shouldIncludeUserSubscribedTo,
                        subscribedToUser: shouldIncludeSubscribedToUser,
                    },
                });

                if (shouldIncludeSubscribedToUser || shouldIncludeUserSubscribedTo) {
                    const usersSet = new Set<User>();
                    users.forEach((i: any) => usersSet.add(i));

                    users.forEach((user: any) => {
                        if (shouldIncludeUserSubscribedTo) {
                            dataLoader.userSubscribedToLoader.prime(
                                user.id,
                                user.userSubscribedTo.map((i: any) => Array.from(usersSet.values())
                                    .find(j => j.id === i.authorId) as User),
                            );
                        }

                        if (shouldIncludeSubscribedToUser) {
                            dataLoader.subscribedToUserLoader.prime(
                                user.id,
                                user.subscribedToUser.map((i: any) => Array.from(usersSet.values())
                                    .find(j => j.id === i.subscriberId) as User),
                            );
                        }
                    });
                }
                return users;
            }
        },
        posts: {
            type: new GraphQLList(PostType),
            resolve: async (_parent, _args, { prisma }) => await prisma.post.findMany()
        },
        memberTypes: {
            type: new GraphQLList(MemberType),
            resolve: async (_parent, _args, { prisma }) => await prisma.memberType.findMany()
        },
        profiles: {
            type: new GraphQLList(ProfileType),
            resolve: async (_parent, _args, { prisma }) => await prisma.profile.findMany()
        },
        user: {
            type: UserType,
            args: { id: { type: UUIDType } },
            resolve: async (_parent, { id }, { prisma }, _info) => await prisma.user.findUnique({ where: { id } })
        },
        post: {
            type: PostType,
            args: { id: { type: UUIDType } },
            resolve: async (_parent, { id }, { prisma }, _info) => await prisma.post.findUnique({ where: { id } })
        },
        memberType: {
            type: MemberType,
            args: { id: { type: MemberIdType } },
            resolve: async (_parent, { id }, { prisma }, _info) => await prisma.memberType.findUnique({ where: { id } })
        },
        profile: {
            type: ProfileType,
            args: { id: { type: UUIDType } },
            resolve: async (_parent, { id }, { prisma }, _info) => await prisma.profile.findUnique({ where: { id } })
        },
    }
})
