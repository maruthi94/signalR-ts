export default function PromiseMaker(req: any) {
  req.promise = function() {
    return new Promise((resolve, reject) => {
      req.end((err: any, res: any) => {
        err = err || res.error;
        if (err) {
          reject(err);
        } else {
          resolve(res.body);
        }
      });
    });
  };
}
