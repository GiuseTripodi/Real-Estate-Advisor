import { Schema, Document, model, Model } from 'mongoose';

export interface MyAttrs {
  name: string;
}

export interface MyModel extends Model<MyDocument> {
  addOne(doc: MyAttrs): MyDocument;
}
export interface MyDocument extends Document {
  name: string;
  createdAt: string;
  updatedAt: string;
}
export const MySchema: Schema = new Schema(
  {
      name: {
          type: String,
          required: true
      }
  },
  {
      timestamps: true
  }
);

MySchema.statics.addOne = (doc: MyAttrs) => {
  return new MyCollectionItem(doc);
};

export const MyCollectionItem = model<MyDocument, MyModel>('MyCollectionItem', MySchema);
