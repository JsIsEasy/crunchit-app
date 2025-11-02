const supportedMEMETypes = /^image\/.*|^video\/.*/;

const MAX_FILE_SIZE = 1024 * 1024 * 10; // 10 MB

const dbStatusToDisplay = {
    'ready-to-crunch':'Ready to crunch',
    'uploading':'Uploading',
    'uploaded':'Uploaded',
    'upload-failed':'Upload Failed',
    'crunching':'Crunching',
    'crunched':'Crunched',
    'ready-to-download':'Ready to download',
    'crunch-failed':'Crunch Failed',
    'downloading':'Downloading',
    'downloaded':'Downloaded',
    'download-failed':'Download Failed'
};

export { supportedMEMETypes, dbStatusToDisplay, MAX_FILE_SIZE };
