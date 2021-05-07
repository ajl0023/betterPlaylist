import reducer from "../../spotify-redux/reducers/reducer";

export const reducerObj = reducer(
  {
    tracks: {
      ...reducer({}, {}).tracks,
      byIds: {
        "6081f5bdd0ea054c94c456a5": {
          album: {
            album_type: "album",
            artists: [
              {
                id: "4BzCdhJTyTS3gumq9xmymb",
                name: "ayokay",
                type: "artist",
              },
            ],

            href: "https://api.spotify.com/v1/albums/7arFGGWl2p1FTC3LPTw7Dz",
            id: "7arFGGWl2p1FTC3LPTw7Dz",
            images: [
              {
                height: 64,

                width: 64,
              },
            ],
            name: "In the Shape of a Dream",

            uri: "spotify:album:7arFGGWl2p1FTC3LPTw7Dz",
          },
          artists: [
            {
              id: "4BzCdhJTyTS3gumq9xmymb",
              name: "ayokay",
              type: "artist",
              uri: "spotify:artist:4BzCdhJTyTS3gumq9xmymb",
            },
            {
              href: "https://api.spotify.com/v1/artists/3qDMrpZHtZEtVl5i1l7hP3",
              id: "3qDMrpZHtZEtVl5i1l7hP3",
              name: "Nightly",
              type: "artist",
              uri: "spotify:artist:3qDMrpZHtZEtVl5i1l7hP3",
            },
          ],

          id: "4PUWpNtDejQwwa80LjvxXl",

          name: "Sleepless Nights (feat. Nightly)",

          uri: "spotify:track:4PUWpNtDejQwwa80LjvxXl",
          position: 5,
          uid: "6081f5bdd0ea054c94c456a5",
        },
        "1f5bdd0ea054c94c456a5": {
          album: {
            album_type: "album",
            artists: [
              {
                id: "4BzCdhJTyTS3gumq9xmymb",
                name: "ayokay",
                type: "artist",
              },
            ],

            href: "https://api.spotify.com/v1/albums/7arFGGWl2p1FTC3LPTw7Dz",
            id: "7arFGGWl2p1FTC3LPTw7Dz",
            images: [
              {
                height: 64,

                width: 64,
              },
            ],
            name: "album",

            uri: "spotify:album:7arFGGWl2p1FTC3LPTw7Dz",
          },
          artists: [
            {
              id: "4BzCdhJTyTS3gumq9xmymb",
              name: "ayokay",
              type: "artist",
              uri: "spotify:artist:4BzCdhJTyTS3gumq9xmymb",
            },
            {
              href: "https://api.spotify.com/v1/artists/3qDMrpZHtZEtVl5i1l7hP3",
              id: "3qDMrpZHtZEtVl5i1l7hP3",
              name: "Nightly",
              type: "artist",
              uri: "spotify:artist:3qDMrpZHtZEtVl5i1l7hP3",
            },
          ],

          id: "4PUWpNtDejQwwa80LjvxXl",

          name: "song name",

          uri: "spotify:track:4PUWpNtDejQwwa80LjvxXl",
          position: 5,
          uid: "1f5bdd0ea054c94c456a5",
        },
      },
    },

    playlists: {
      ...reducer({}, {}).playlists,
      byIds: {
        testplaylist1: {
          tracks: ["6081f5bdd0ea054c94c456a5", "1f5bdd0ea054c94c456a5"],
          id: "testplaylist1",
          name: "My playlist #6",
          images: [
            {
              height: 640,
              url: "",
              width: 640,
            },
          ],
          owner: {
            display_name: "Austin Lee",
          },
        },
        1234: {
          tracks: ["6081f5bdd0ea054c94c456a5", "1f5bdd0ea054c94c456a5"],

          id: "1234",
          images: [
            {
              height: 640,
              url: "",
              width: 640,
            },
          ],
          owner: {
            display_name: "Austin Lee",
          },
        },
      },
    },
    search: {
      results: [],
    },
  },
  {}
);
