import React from 'react';
import Avatar from 'material-ui/Avatar';
import {blue500, yellow600} from 'material-ui/styles/colors';

// Icons
import EditorInsertChart from 'material-ui/svg-icons/editor/insert-chart';
import ActionAssignment from 'material-ui/svg-icons/action/assignment';
import ActionInfo from 'material-ui/svg-icons/action/info';
import FileFolder from 'material-ui/svg-icons/file/folder';
import Image from 'material-ui/svg-icons/image/crop-original';
import Image2 from 'material-ui/svg-icons/image/panorama';
import Image3 from 'material-ui/svg-icons/image/image';
import Photo from 'material-ui/svg-icons/image/photo';
import Video from 'material-ui/svg-icons/image/movie-creation';
import Music from 'material-ui/svg-icons/image/music-note';
import AudioTrack from 'material-ui/svg-icons/image/audiotrack';
import Chart from 'material-ui/svg-icons/social/poll';

// const icons = {
//   'application/vnd.google-apps.folder': <Avatar icon={<FileFolder />} />,
//   'application/vnd.google-apps.document': <Avatar src='icons/docs_24dp.png' size={24}/>,
//   'application/vnd.google-apps.presentation': <Avatar icon={<AudioTrack />} />,
//   'application/vnd.google-apps.drawing': <Avatar src='icons/drawings_36dp.png' />,
//   'application/vnd.google-apps.script': <Avatar src='icons/apps_script_36dp.png' />,
//   'image/png': <Avatar icon={<Image />} />,
//   'application/pdf': <Avatar icon={<AudioTrack />} />,
// };
const icons = {
  'application/vnd.google-apps.folder': <Avatar icon={<FileFolder />} />,
  'image/png': <Avatar icon={<Image />} backgroundColor={yellow600} />,
};
const unknown = <Avatar icon={<ActionAssignment />} backgroundColor={blue500} />;

class MIMEInfo {

  static getIcon(mimeType) {
    let icon = icons[mimeType];

    if (icon === undefined) {
      return unknown;
    }

    return icon;
  }
}

export default MIMEInfo;
