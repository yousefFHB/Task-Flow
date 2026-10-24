import { apiSlice } from '../../api/apiSlice.js';

export const teamApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTeams: builder.query({
      query: () => '/teams',
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map((item) => ({ type: 'Team', id: item.team?.id || item.id })),
              { type: 'Team', id: 'LIST' },
            ]
          : [{ type: 'Team', id: 'LIST' }],
    }),

    getTeamById: builder.query({
      query: (id) => `/teams/${id}`,
      providesTags: (result, error, id) => [{ type: 'Team', id }],
    }),

    getCompanyTeams: builder.query({
      query: (companyId) => `/teams/company/${companyId}`,
      providesTags: (result, error, companyId) => [
        { type: 'Team', id: `COMPANY_${companyId}` },
        { type: 'Team', id: 'LIST' },
      ],
    }),

    createTeam: builder.mutation({
      query: (data) => ({
        url: '/teams',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Team', id: 'LIST' }],
    }),

    updateTeam: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/teams/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Team', id },
        { type: 'Team', id: 'LIST' },
      ],
    }),

    deleteTeam: builder.mutation({
      query: (id) => ({
        url: `/teams/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Team', id: 'LIST' }],
    }),

    addTeamMember: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/teams/${id}/member`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Team', id },
        { type: 'Team', id: 'LIST' },
      ],
    }),

    removeTeamMember: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/teams/${id}/member`,
        method: 'DELETE',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Team', id },
        { type: 'Team', id: 'LIST' },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetTeamsQuery,
  useGetTeamByIdQuery,
  useGetCompanyTeamsQuery,
  useCreateTeamMutation,
  useUpdateTeamMutation,
  useDeleteTeamMutation,
  useAddTeamMemberMutation,
  useRemoveTeamMemberMutation,
} = teamApi;

export default teamApi;
