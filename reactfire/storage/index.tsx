import { storage } from 'firebase/app';
import { getDownloadURL } from 'rxfire/storage';
import { Observable } from 'rxjs';
import { ReactFireOptions, useObservable } from '..';

/**
 * modified version of rxFire's _fromTask
 *
 * @param task
 */
function _fromTask(task: storage.UploadTask) {
  return new Observable<storage.UploadTaskSnapshot>(subscriber => {
    const progress = (snap: storage.UploadTaskSnapshot) => {
      return subscriber.next(snap);
    };
    const error = e => subscriber.error(e);
    const complete = () => {
      return subscriber.complete();
    };
    task.on('state_changed', progress, error, complete);

    // I REMOVED THE UNSUBSCRIBE RETURN BECAUSE IT CANCELS THE UPLOAD
    // https://github.com/firebase/firebase-js-sdk/issues/1659
  });
}

/**
 * Subscribe to the progress of a storage task
 *
 * @param task - the task you want to listen to
 * @param ref - reference to the blob the task is acting on
 * @param options
 */
export function useStorageTask<T = unknown>(
  task: storage.UploadTask,
  ref: storage.Reference,
  options?: ReactFireOptions<T>
): storage.UploadTaskSnapshot | T {
  return useObservable(
    _fromTask(task),
    'storage upload: ' + ref.toString(),
    options ? options.startWithValue : undefined
  );
}

/**
 * Subscribe to a storage ref's download URL
 *
 * @param ref - reference to the blob you want to download
 * @param options
 */
export function useStorageDownloadURL<T = string>(
  ref: storage.Reference,
  options?: ReactFireOptions<T>
): string | T {
  return useObservable(
    getDownloadURL(ref),
    'storage download:' + ref.toString(),
    options ? options.startWithValue : undefined
  );
}
