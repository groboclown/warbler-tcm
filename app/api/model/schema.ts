
// 1-for-1 with the warbler-schema-v1.json file.

export interface MetaData {
  creationDate: string
  authors: string[]
  tags: string[]
  [propName: string]: any
}

export interface OrderedTextItem {
  id: string
  text: string
}

export interface FieldMetadata {
  /** one of ["date", "time", "date-time", "integer", "float", "text", "markdown"] */
  type?: string
  format?: string

  /** one of ["required", "optional", "hidden"] */
  visibility?: string
}

export interface FieldsMetadata {
  [propName: string]: FieldMetadata
}

export interface TestCaseData {
  tcId: string
  metadata?: MetaData
  section?: string
  objective?: string
  comment?: string
  setup?: OrderedTextItem[]
  steps?: OrderedTextItem[]
  expected?: OrderedTextItem[]
  teardown?: OrderedTextItem[]
  priority?: number
  requirements?: string[]
}

export interface TestExecutionResultData {
  tcId: string

  /** one of [
    "passed",
    "failed",
    "skipped",
    "blocked",
    "invalid",
    "wontfix",
    "running"
  ] */
  status?: string

  issues?: string[]
  stepComments?: OrderedTextItem[]
  comments?: string
}

export interface TestExecutionData {
  runId: string
  metadata?: MetaData
  comment?: string
  version?: string
  revId?: string
  results?: TestExecutionResultData[]
}

export interface TestPlanData {
  id: string
  revId?: string
  name?: string
  metadata?: MetaData
  description?: string
  product?: string
  setup?: OrderedTextItem[]
  teardown?: OrderedTextItem[]
  testFields?: FieldsMetadata
  runFields?: FieldsMetadata
  tests?: TestCaseData[]
  runs?: TestExecutionData[]
}
