
export interface Author {
  key: string;
  name: string;
}

export interface Availability {
  status: string;
  available_to_borrow: boolean;
  available_to_browse: boolean;
  available_to_waitlist: boolean;
  is_browsable: boolean;
  is_previewable: boolean;
  is_printdisabled: boolean;
  is_readable: boolean;
  is_lendable: boolean;
  is_restricted: boolean;
  identifier?: string;
  isbn?: string;
  openlibrary_edition?: string;
  openlibrary_work?: string;
}

export interface Books {
  key: string;
  title: string;
  edition_count: number;
  cover_id?: number;
  cover_edition_key?: string;
  first_publish_year?: number;
  has_fulltext?: boolean;
  ia?: string;
  lending_edition?: string;
  lending_identifier?: string;
  printdisabled?: boolean;
  public_scan?: boolean;
  authors?: Author[];
  availability?: Availability;
  ia_collection?: string[];
  subject?: string[];
}