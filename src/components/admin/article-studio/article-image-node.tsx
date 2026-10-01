"use client";

import type { JSX } from "react";
import NextImage from "next/image";
import {
  $applyNodeReplacement,
  $getDocument,
  DecoratorNode,
  type DOMExportOutput,
  type LexicalNode,
  type NodeKey,
  type SerializedLexicalNode,
  type Spread,
} from "lexical";

export type ArticleImagePayload = {
  altText: string;
  height: number;
  key?: NodeKey;
  src: string;
  width: number;
};

export type SerializedArticleImageNode = Spread<
  {
    altText: string;
    height: number;
    src: string;
    width: number;
  },
  SerializedLexicalNode
>;

export class ArticleImageNode extends DecoratorNode<JSX.Element> {
  __altText: string;
  __height: number;
  __src: string;
  __width: number;

  static getType(): string {
    return "image";
  }

  static clone(node: ArticleImageNode): ArticleImageNode {
    return new ArticleImageNode(
      node.__src,
      node.__altText,
      node.__width,
      node.__height,
      node.__key,
    );
  }

  static importJSON(
    serializedNode: SerializedArticleImageNode,
  ): ArticleImageNode {
    return $createArticleImageNode(serializedNode);
  }

  constructor(
    src: string,
    altText: string,
    width: number,
    height: number,
    key?: NodeKey,
  ) {
    super(key);
    this.__altText = altText;
    this.__height = height;
    this.__src = src;
    this.__width = width;
  }

  createDOM(): HTMLElement {
    return $getDocument().createElement("div");
  }

  decorate(): JSX.Element {
    return (
      <NextImage
        alt={this.__altText}
        src={this.__src}
        width={this.__width}
        height={this.__height}
        unoptimized
        className="my-4 h-auto max-w-full border border-black/10"
      />
    );
  }

  exportDOM(): DOMExportOutput {
    const image = $getDocument().createElement("img");
    image.setAttribute("alt", this.__altText);
    image.setAttribute("height", String(this.__height));
    image.setAttribute("src", this.__src);
    image.setAttribute("width", String(this.__width));

    return { element: image };
  }

  exportJSON(): SerializedArticleImageNode {
    return {
      ...super.exportJSON(),
      altText: this.__altText,
      height: this.__height,
      src: this.__src,
      type: "image",
      version: 1,
      width: this.__width,
    };
  }

  getAltText(): string {
    return this.getLatest().__altText;
  }

  getHeight(): number {
    return this.getLatest().__height;
  }

  getSrc(): string {
    return this.getLatest().__src;
  }

  getWidth(): number {
    return this.getLatest().__width;
  }

  isInline(): false {
    return false;
  }

  isKeyboardSelectable(): true {
    return true;
  }

  updateDOM(): false {
    return false;
  }
}

export function $createArticleImageNode(
  payload: ArticleImagePayload,
): ArticleImageNode {
  return $applyNodeReplacement(
    new ArticleImageNode(
      payload.src,
      payload.altText,
      Math.max(1, payload.width),
      Math.max(1, payload.height),
      payload.key,
    ),
  );
}

export function $isArticleImageNode(
  node: LexicalNode | null | undefined,
): node is ArticleImageNode {
  return node instanceof ArticleImageNode;
}
