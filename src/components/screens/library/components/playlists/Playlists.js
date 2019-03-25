// @flow

import React, { Component } from 'react';
import {
  TouchableOpacity, FlatList, View, Text, Platform,
} from 'react-native';
import styled from 'styled-components';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Creators as PlaylistsCreators } from '~/store/ducks/playlist';

import PlaylistOperationModal from './PlaylistOperationModal';
import PlaylistListItem from './PlaylistListItem';

import { CustomAlert, TYPES } from '~/components/common/Alert';
import Icon from '~/components/common/Icon';
import { ROUTE_NAMES } from '../../routes';
import CONSTANTS from '~/utils/CONSTANTS';
import appStyles from '~/styles';

const Wrapper = styled(View)`
  width: 100%;
  height: 100%;
  flex: 1;
  padding-horizontal: ${({ theme }) => theme.metrics.largeSize}px;
  padding-top: ${({ theme }) => theme.metrics.largeSize}px;
`;

const PlaylistsText = styled(Text)`
  font-size: ${({ theme }) => theme.metrics.getWidthFromDP('6.5%')}px;
  font-family: CircularStd-Bold;
  color: ${({ theme }) => theme.colors.white};
`;

const Header = styled(View)`
  width: 100%;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.metrics.largeSize}px;
`;

// type Props = {
//   podcastsDownloaded: Array<Object>,
//   playlists: Array<Playlist>,
//   removePlaylist: Function,
//   createPlaylist: Function,
//   editPlaylist: Function,
//   navigation: Object,
// };

// type State = {
//   isPlaylistOperationModalOpen: boolean,
//   isPlaylistTitleAlreadyInUse: boolean,
//   indexPlaylistToEdit: number,
//   playlistTitle: string,
//   modalMode: string,
// };

// type Playlist = {
//   isAvailableOffline: boolean,
//   dowloads: Array<string>,
//   podcasts: Array<Object>,
//   title: string,
// };

type Props = {
  onRemovePlaylist: Function,
  playlists: Array<Playlist>,
  modalOperations: Object,
  navigation: Object,
};

type State = {
  isPlaylistOperationModalOpen: boolean,
  isPlaylistTitleAlreadyInUse: boolean,
  indexPlaylistToEdit: number,
  playlistTitle: string,
  modalMode: string,
};

class Playlists extends Component<Props, State> {
  state = {
    isPlaylistOperationModalOpen: false,
    isPlaylistTitleAlreadyInUse: true,
    indexPlaylistToEdit: 0,
    playlistTitle: '',
    modalMode: '',
  };

  getPodcastImages = (podcasts: Array<Object>): Array<string> => {
    const images = podcasts.slice(0, 4).map(podcast => podcast.smallImageURL);

    return images;
  };

  onCreatePlaylist = (playlistTitleFromIos: ?string): void => {
    const { createPlaylist } = this.props;
    const { playlistTitle } = this.state;

    const title = playlistTitleFromIos || playlistTitle;

    if (!title) {
      this.setState({
        isPlaylistOperationModalOpen: false,
      });

      return;
    }

    const isTitleAlreadyInUse = this.checkPlaylistTitleIsAlreadyInUse(title);

    if (isTitleAlreadyInUse) {
      this.setState({
        isPlaylistTitleAlreadyInUse: true,
      });

      return;
    }

    createPlaylist(title);

    this.setState({
      isPlaylistOperationModalOpen: false,
      isPlaylistTitleAlreadyInUse: false,
      playlistTitle: '',
    });
  };

  onEditPlaylist = (playlistTitleFromIos: ?string): void => {
    const { indexPlaylistToEdit, playlistTitle } = this.state;
    const { editPlaylist, playlists } = this.props;

    const title = playlistTitleFromIos || playlistTitle;

    if (!title) {
      this.setState({
        isPlaylistOperationModalOpen: false,
      });

      return;
    }

    const isSameTitle = title === playlists[indexPlaylistToEdit].title;

    if (isSameTitle) {
      this.setState({
        isPlaylistOperationModalOpen: false,
      });

      return;
    }

    const isTitleAlreadyInUse = this.checkPlaylistTitleIsAlreadyInUse(title);

    if (isTitleAlreadyInUse) {
      this.setState({
        isPlaylistTitleAlreadyInUse: true,
      });

      return;
    }

    editPlaylist(title, indexPlaylistToEdit);

    this.setState({
      isPlaylistOperationModalOpen: false,
      isPlaylistTitleAlreadyInUse: false,
      playlistTitle: '',
    });
  };

  onTogglePlaylistOperationModal = (
    modalMode: string,
    playlistTitle: string,
    index: number,
  ): void => {
    const { isPlaylistOperationModalOpen } = this.state;

    this.setState({
      isPlaylistOperationModalOpen: !isPlaylistOperationModalOpen,
      isPlaylistTitleAlreadyInUse: false,
      indexPlaylistToEdit: index,
      playlistTitle,
      modalMode,
    });
  };

  checkPlaylistTitleIsAlreadyInUse = (title: string): boolean => {
    const { playlists } = this.props;

    const isTitleAlreadyInUse = playlists.some(
      playlist => playlist.title.toUpperCase() === title.toUpperCase(),
    );

    return isTitleAlreadyInUse;
  };

  onRemovePlaylist = (playlist: Playlist): void => {
    const { removePlaylist } = this.props;

    CustomAlert(TYPES.REMOVE_PLAYLIST, () => removePlaylist(playlist));
  };

  // onTypePlaylistTitle = (playlistTitle: string): void => {
  //   this.setState({
  //     isPlaylistTitleAlreadyInUse: false,
  //     playlistTitle,
  //   });
  // };

  onPressPlaylistItem = (playlistTitle: string): void => {
    const { navigation } = this.props;

    navigation.navigate(ROUTE_NAMES.PLAYLIST_DETAIL, {
      [CONSTANTS.PARAMS.PLAYLIST_TITLE]: playlistTitle,
    });
  };

  render() {
    const {
      isPlaylistOperationModalOpen,
      isPlaylistTitleAlreadyInUse,
      playlistTitle,
      modalMode,
    } = this.state;

    const { playlists } = this.props;
    const isModalCreationMode = modalMode === 'Create';

    return (
      <Wrapper>
        <Header>
          <PlaylistsText>Playlists</PlaylistsText>
          <TouchableOpacity
            hitSlop={{
              bottom: appStyles.metrics.smallSize,
              right: appStyles.metrics.smallSize,
              left: appStyles.metrics.smallSize,
              top: appStyles.metrics.smallSize,
            }}
            onPress={() => this.onTogglePlaylistOperationModal('Create')}
          >
            <Icon
              color={appStyles.colors.white}
              name="plus"
              size={26}
            />
          </TouchableOpacity>
        </Header>
        <FlatList
          renderItem={({ item, index }) => {
            const images = this.getPodcastImages(item.podcasts);

            return (
              <PlaylistListItem
                onEditPlaylist={() => this.onTogglePlaylistOperationModal('Edit', item.title, index)
                }
                onRemovePlaylist={() => this.onRemovePlaylist(item)}
                onPress={() => this.onPressPlaylistItem(item.title)}
                numberOfPodcasts={item.podcasts.length}
                isDownloaded={item.isAvailableOffline}
                title={item.title}
                images={images}
              />
            );
          }}
          showsVerticalScrollIndicator={false}
          keyExtractor={item => `${item.title}`}
          data={playlists}
        />
        {isPlaylistOperationModalOpen && (
          <PlaylistOperationModal
            toggleModal={() => this.setState({
              isPlaylistOperationModalOpen: false,
            })
            }
            mainAction={
              isModalCreationMode ? this.onCreatePlaylist : this.onEditPlaylist
            }
            hasError={isPlaylistTitleAlreadyInUse}
            playlistTitle={playlistTitle}
            mode={modalMode}
          />
        )}
      </Wrapper>
    );
  }
}

const mapDispatchToProps = dispatch => bindActionCreators(PlaylistsCreators, dispatch);

const mapStateToProps = state => ({
  playlists: state.playlist.playlists,
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Playlists);
