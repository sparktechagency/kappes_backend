import { Request, Response, NextFunction } from 'express';
import { getMultipleFilesPath, IFolderName } from '../../shared/getFilePath';

// const parseMultipleFilesdata = (req: Request, res: Response, next: NextFunction) => {
//      try {
//           const image = getMultipleFilesPath(req.files, 'image');
//           if (req.body.data) {
//                const data = JSON.parse(req.body.data);
//                req.body = { image, ...data };
//           } else {
//                req.body = { image };
//           }
//           next();
//      } catch (error) {
//           next(error);
//      }
// };

const parseMultipleFilesdata = (fieldName: IFolderName) => {
     return async (req: Request, res: Response, next: NextFunction) => {
          try {
               const image = getMultipleFilesPath(req.files, fieldName);
               if (req.body.data) {
                    const data = JSON.parse(req.body.data);
                    req.body = { ...data, [fieldName]:image };
               } else {
                    req.body = { ...req.body,[fieldName]:image };
               }
               next();
          } catch (error) {
               next(error);
          }
     };
};

export default parseMultipleFilesdata;
